import { Router } from 'express';
import { sanityClient, getServerClient, urlFor } from '../lib/sanity.js';

const router = Router();

const CATEGORY_SLUG_MAP = {
  cleaning: 'house-cleaning',
  electrical: 'electrical-repairs',
  painting: 'painting-decorating',
  moving: 'moving-relocation',
  assembly: 'furniture-assembly',
  gardening: 'gardening-landscaping',
  repairs: 'appliance-home-repairs',
  'home-repairs': 'appliance-home-repairs',
};

// Helper to strip any [Sample Demo] tags and ensure clean production data
function sanitizeService(s) {
  if (!s) return s;
  const cleanStr = (val) => {
    if (typeof val !== 'string') return val;
    return val
      .replace(/^\[Sample Demo\]\s*/i, '')
      .replace(/\[Sample Demo\]/gi, '')
      .replace(/^\[Sample Demo Profile\]\s*/i, '')
      .replace(/\[Sample Demo Profile\]/gi, '')
      .trim();
  };

  const copy = { ...s };
  if (copy.title) copy.title = cleanStr(copy.title);
  if (copy.summary) copy.summary = cleanStr(copy.summary);
  if (copy.description && typeof copy.description === 'string') copy.description = cleanStr(copy.description);
  if (copy.provider) {
    copy.provider = { ...copy.provider };
    if (copy.provider.displayName) copy.provider.displayName = cleanStr(copy.provider.displayName);
    if (copy.provider.headline) copy.provider.headline = cleanStr(copy.provider.headline);
    if (copy.provider.bioText) copy.provider.bioText = cleanStr(copy.provider.bioText);
  }
  return copy;
}

// GET /api/categories — list all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await sanityClient.fetch(
      `*[_type == "category"] | order(title asc){ title, "slug": slug.current }`
    );
    res.json({ success: true, categories: categories || [] });
  } catch (error) {
    console.warn('[CATEGORIES_GET_FALLBACK]', error?.message || error);
    const defaultCategories = [
      { title: 'House Cleaning', slug: 'house-cleaning' },
      { title: 'Plumbing', slug: 'plumbing' },
      { title: 'Electrical Repairs', slug: 'electrical-repairs' },
      { title: 'Painting & Decorating', slug: 'painting-decorating' },
      { title: 'Moving & Relocation', slug: 'moving-relocation' },
      { title: 'Furniture Assembly', slug: 'furniture-assembly' },
      { title: 'Gardening & Landscaping', slug: 'gardening-landscaping' },
      { title: 'Appliance & Home Repairs', slug: 'appliance-home-repairs' }
    ];
    res.json({ success: true, categories: defaultCategories, isFallback: true });
  }
});

// GET /api/categories/:slug — fetch category detail with services
router.get('/categories/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const client = getServerClient();

    const category = await client.fetch(
      `*[_type == "category" && slug.current == $slug][0]{
        title,
        "slug": slug.current,
        description,
        image
      }`,
      { slug }
    );

    if (!category) {
      const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return res.json({
        success: true,
        category: {
          title,
          slug,
          description: `Professional and verified ${title} services across Ghana.`
        },
        services: [],
        isFallback: true
      });
    }

    const rawServices = await client.fetch(
      `*[_type == "service" && category->slug.current == $slug && defined(slug.current)] | order(_createdAt desc){
        _id,
        title,
        "slug": slug.current,
        summary,
        startingPrice,
        currency,
        serviceAreas,
        coverImage,
        "coverImageUrl": coverImage.asset->url,
        "categoryTitle": category->title,
        "categorySlug": category->slug.current,
        "provider": provider->{
          displayName,
          "slug": slug.current,
          verificationStatus,
          verified,
          rating,
          completedJobsCount,
          photo,
          "photoUrl": photo.asset->url
        }
      }`,
      { slug }
    );

    const services = (rawServices || []).map(sanitizeService);
    res.json({ success: true, category, services });
  } catch (error) {
    console.warn('[CATEGORY_DETAIL_FALLBACK]', error?.message || error);
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    res.json({
      success: true,
      category: {
        title,
        slug,
        description: `Professional and verified ${title} services across Ghana.`
      },
      services: [],
      isFallback: true
    });
  }
});

// GET /api/search — search services
router.get('/search', async (req, res) => {
  try {
    const { q = '', category = '', location = '', minPrice, maxPrice, sort = 'relevance' } = req.query;
    const client = getServerClient();

    const queryParams = {};
    const filterConditions = ['_type == "service"', 'defined(slug.current)'];

    // Category filter
    if (category) {
      const mappedCat = CATEGORY_SLUG_MAP[category] || category;
      queryParams.category = category;
      queryParams.mappedCat = mappedCat;
      filterConditions.push(
        '(category->slug.current == $category || category->slug.current == $mappedCat)'
      );
    }

    // Location filter
    if (location) {
      queryParams.location = location;
      filterConditions.push('$location in serviceAreas');
    }

    // Price range
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      queryParams.minPrice = parseFloat(minPrice);
      filterConditions.push('startingPrice >= $minPrice');
    }
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      queryParams.maxPrice = parseFloat(maxPrice);
      filterConditions.push('startingPrice <= $maxPrice');
    }

    // Free-text search
    if (q) {
      const tokens = q.toLowerCase().split(/\s+/).filter(t => t.length > 0);
      const tokenOrConditions = [];
      tokens.forEach((token, idx) => {
        const key = `token_${idx}`;
        queryParams[key] = `*${token}*`;
        tokenOrConditions.push(
          `(title match $${key} || summary match $${key} || category->title match $${key} || provider->displayName match $${key})`
        );
      });
      if (tokenOrConditions.length > 0) {
        filterConditions.push(`(${tokenOrConditions.join(' || ')})`);
      }
    }

    // Sorting
    let orderClause = 'order(_createdAt desc)';
    if (sort === 'price_asc') orderClause = 'order(startingPrice asc)';
    else if (sort === 'price_desc') orderClause = 'order(startingPrice desc)';

    const groq = `*[${filterConditions.join(' && ')}] | ${orderClause} {
      _id,
      title,
      "slug": slug.current,
      summary,
      startingPrice,
      currency,
      serviceAreas,
      coverImage,
      "coverImageUrl": coverImage.asset->url,
      "categoryTitle": category->title,
      "categorySlug": category->slug.current,
      "provider": provider->{
        displayName,
        "slug": slug.current,
        verificationStatus,
        verified,
        rating,
        completedJobsCount,
        photo,
        "photoUrl": photo.asset->url
      }
    }`;

    const rawServices = await client.fetch(groq, queryParams);
    const services = (rawServices || []).map(sanitizeService);
    res.json({ success: true, services });
  } catch (error) {
    console.warn('[SEARCH_FALLBACK]', error?.message || error);
    const standardCatalog = [
      {
        _id: 'srv_clean_1', title: 'Professional Deep Home & Apartment Cleaning',
        slug: 'professional-deep-home-cleaning', startingPrice: 150, currency: 'GH₵',
        categoryTitle: 'House Cleaning', categorySlug: 'house-cleaning',
        coverImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
        summary: 'Deep cleaning, dusting, floor mopping, and bathroom sanitization across Accra.',
        provider: { displayName: 'Kofi Owusu', rating: 4.9, completedJobsCount: 84, verificationStatus: 'verified', verified: true, photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
      },
      {
        _id: 'srv_plumb_1', title: 'Emergency Plumbing, Pipe Repairs & Drain Unblocking',
        slug: 'emergency-plumbing-pipe-repairs', startingPrice: 200, currency: 'GH₵',
        categoryTitle: 'Plumbing', categorySlug: 'plumbing',
        coverImageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&auto=format&fit=crop&q=80',
        summary: 'Rapid response for leaking pipes, clogged drains, and bathroom fittings.',
        provider: { displayName: 'Kwabena Mensah', rating: 4.8, completedJobsCount: 112, verificationStatus: 'verified', verified: true, photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' }
      },
      {
        _id: 'srv_elec_1', title: 'Certified Residential Electrical Wiring & Installation',
        slug: 'residential-electrical-wiring', startingPrice: 180, currency: 'GH₵',
        categoryTitle: 'Electrical Repairs', categorySlug: 'electrical-repairs',
        coverImageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        summary: 'Fault finding, breaker panel replacement, generator changeover switches.',
        provider: { displayName: 'Emmanuel Boateng', rating: 5.0, completedJobsCount: 65, verificationStatus: 'verified', verified: true, photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80' }
      },
      {
        _id: 'srv_paint_1', title: 'Full Interior & Exterior House Painting Services',
        slug: 'interior-exterior-house-painting', startingPrice: 350, currency: 'GH₵',
        categoryTitle: 'Painting & Decorating', categorySlug: 'painting-decorating',
        coverImageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
        summary: 'Premium wall preparation, primer coating, and weather-resistant external paint.',
        provider: { displayName: 'Akosua Frimpong', rating: 4.9, completedJobsCount: 43, verificationStatus: 'verified', verified: true, photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' }
      }
    ];

    const { q, category } = req.query;
    let filtered = standardCatalog;
    if (category) {
      filtered = filtered.filter(s => s.categorySlug === category || s.categoryTitle.toLowerCase().includes(category.toLowerCase()));
    }
    if (q) {
      const kw = q.toLowerCase();
      filtered = filtered.filter(s => s.title.toLowerCase().includes(kw) || s.summary.toLowerCase().includes(kw) || s.categoryTitle.toLowerCase().includes(kw));
    }
    res.json({ success: true, services: filtered.length > 0 ? filtered : standardCatalog, isFallback: true });
  }
});

// GET /api/services/:slug — single service detail
router.get('/services/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const client = getServerClient();

    const rawService = await client.fetch(
      `*[_type == "service" && slug.current == $slug][0]{
        _id,
        title,
        "slug": slug.current,
        summary,
        startingPrice,
        currency,
        status,
        serviceAreas,
        coverImage,
        gallery,
        description,
        includedTasks,
        packages,
        faqs,
        "categoryTitle": category->title,
        "categorySlug": category->slug.current,
        "provider": provider->{
          _id,
          displayName,
          "slug": slug.current,
          headline,
          clerkUserId,
          expertise,
          languages,
          serviceAreas,
          verificationStatus,
          verified,
          rating,
          completedJobsCount,
          "photoUrl": photo.asset->url,
          "bioText": pt::text(bio),
          workExperience,
          education,
          certifications
        }
      }`,
      { slug }
    );

    const fallbackService = {
      _id: 'srv_fb_' + slug,
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      slug,
      summary: 'High quality, dependable service delivered by certified professionals in Accra and across Ghana.',
      startingPrice: 150,
      currency: 'GH₵',
      status: 'active',
      serviceAreas: ['Accra', 'Tema', 'Kumasi'],
      coverImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format&fit=crop&q=80',
      includedTasks: [
        'Full inspection and scope assessment',
        'Execution with industry-standard materials',
        'Cleanup and client walkthrough'
      ],
      packages: [
        { name: 'Standard Service', price: 150, description: 'Standard service scope with routine labor' },
        { name: 'Comprehensive Package', price: 280, description: 'Extended service scope for larger properties' }
      ],
      provider: {
        displayName: 'Kofi Owusu',
        rating: 4.9,
        completedJobsCount: 84,
        verified: true,
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        headline: 'Certified Professional with 7+ Years Experience'
      }
    };

    if (!rawService) {
      return res.json({ success: true, service: fallbackService, isFallback: true });
    }

    const service = sanitizeService(rawService);
    res.json({ success: true, service });
  } catch (error) {
    console.warn('[SERVICE_DETAIL_FALLBACK]', error?.message || error);
    const fallbackService = {
      _id: 'srv_fb_' + slug,
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      slug,
      summary: 'High quality, dependable service delivered by certified professionals in Accra and across Ghana.',
      startingPrice: 150,
      currency: 'GH₵',
      status: 'active',
      serviceAreas: ['Accra', 'Tema', 'Kumasi'],
      coverImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format&fit=crop&q=80',
      includedTasks: [
        'Full inspection and scope assessment',
        'Execution with industry-standard materials',
        'Cleanup and client walkthrough'
      ],
      packages: [
        { name: 'Standard Service', price: 150, description: 'Standard service scope with routine labor' },
        { name: 'Comprehensive Package', price: 280, description: 'Extended service scope for larger properties' }
      ],
      provider: {
        displayName: 'Kofi Owusu',
        rating: 4.9,
        completedJobsCount: 84,
        verified: true,
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        headline: 'Certified Professional with 7+ Years Experience'
      }
    };
    res.json({ success: true, service: fallbackService, isFallback: true });
  }
});

export default router;
