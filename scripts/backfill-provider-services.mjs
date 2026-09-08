import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8');

const pId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.*)/)[1].trim().replace(/['"]/g, '');
const ds = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.*)/)[1].trim().replace(/['"]/g, '');
const writeToken = env.match(/SANITY_API_WRITE_TOKEN=(.*)/)[1].trim().replace(/['"]/g, '');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function main() {
  console.log("Checking for onboarded providers with 0 services...");

  const fetchUrl = `https://${pId}.api.sanity.io/v2024-01-01/data/query/${ds}?query=` + encodeURIComponent(`{
    "categories": *[_type == "category"]{ _id, title, "slug": slug.current, image },
    "providers": *[_type == "providerProfile"]{
      _id,
      displayName,
      headline,
      clerkUserId,
      expertise,
      serviceAreas,
      bio,
      "photo": photo,
      "servicesCount": count(*[_type == "service" && (provider._ref == ^._id || provider->clerkUserId == ^.clerkUserId)])
    }
  }`);

  const res = await fetch(fetchUrl, { headers: { Authorization: `Bearer ${writeToken}` } });
  const data = await res.json();
  const { categories, providers } = data.result;



  const zeroServiceProviders = providers.filter(p => p.servicesCount === 0);
  console.log(`Found ${zeroServiceProviders.length} providers with 0 services.`);

  for (const prov of zeroServiceProviders) {
    console.log(`\nProvisioning initial service for: ${prov.displayName} (${prov.clerkUserId})`);
    
    // Determine category based on headline or expertise
    const allText = `${prov.headline || ''} ${(prov.expertise || []).join(' ')}`.toLowerCase();
    let targetCatSlug = 'house-cleaning';
    if (allText.includes('electr') || allText.includes('circuit') || allText.includes('wiring')) {
      targetCatSlug = 'electrical-repairs';
    } else if (allText.includes('plumb') || allText.includes('pipe') || allText.includes('drain')) {
      targetCatSlug = 'plumbing';
    } else if (allText.includes('paint')) {
      targetCatSlug = 'painting-decorating';
    } else if (allText.includes('mov')) {
      targetCatSlug = 'moving-relocation';
    } else if (allText.includes('furnitur') || allText.includes('assembl')) {
      targetCatSlug = 'furniture-assembly';
    } else if (allText.includes('garden') || allText.includes('lawn')) {
      targetCatSlug = 'gardening-landscaping';
    } else if (allText.includes('repair') || allText.includes('appliance')) {
      targetCatSlug = 'appliance-home-repairs';
    }

    const matchedCat = categories.find(c => c.slug === targetCatSlug) || categories[0];
    const serviceTitle = prov.headline
      ? `${prov.headline} by ${prov.displayName}`
      : `Professional ${matchedCat.title} by ${prov.displayName}`;
    
    const slug = `${slugify(serviceTitle)}-${Date.now().toString(36)}`;
    const area = prov.serviceAreas?.[0] || 'Accra & Greater Accra';

    const serviceDoc = {
      _type: 'service',
      title: serviceTitle,
      slug: { _type: 'slug', current: slug },
      summary: `Verified ${matchedCat.title} service provided by ${prov.displayName} across ${area}, Ghana.`,
      startingPrice: 150,
      currency: 'GHS',
      status: 'published',
      provider: {
        _type: 'reference',
        _ref: prov._id
      },
      category: {
        _type: 'reference',
        _ref: matchedCat._id
      },
      serviceAreas: [area],
      description: prov.bio || [
        {
          _type: 'block',
          _key: `bio-${Date.now()}`,
          style: 'normal',
          children: [{ _type: 'span', _key: `span-${Date.now()}`, text: `Professional ${matchedCat.title} service delivered by certified specialists in Ghana.` }]
        }
      ],
      includedTasks: prov.expertise?.length > 0 ? prov.expertise : ['Initial diagnosis & safety check', 'Full standard execution', 'Post-service cleanup'],
      packages: [
        {
          _type: 'servicePackage',
          _key: `pkg-${Date.now()}`,
          name: 'Standard Package',
          description: `Complete standard appointment for ${matchedCat.title} in ${area}`,
          price: 150,
          scope: 'Standard on-site service and labor',
          duration: '1 - 2 hours',
          includedTasks: prov.expertise?.slice(0, 3) || ['Standard service diagnosis', 'On-site execution'],
          exclusions: ['Specialized parts not included']
        }
      ]
    };

    if (matchedCat.image) {
      serviceDoc.coverImage = matchedCat.image;
    }

    const mutateUrl = `https://${pId}.api.sanity.io/v2024-01-01/data/mutate/${ds}`;
    const mutation = {
      mutations: [
        {
          create: serviceDoc
        }
      ]
    };

    const mutRes = await fetch(mutateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${writeToken}`
      },
      body: JSON.stringify(mutation)
    });

    const mutData = await mutRes.json();
    console.log("Mutation response:", mutData);
  }

  console.log("\nBackfill complete!");
}

main().catch(console.error);
