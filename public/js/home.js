/**
 * Fix-it Marketplace — Homepage Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const categoriesGrid = document.querySelector('#home-categories-grid');
  const servicesGrid = document.querySelector('#home-services-grid');
  const heroSearchForm = document.querySelector('#hero-search-form');

  // Fallback demo categories if backend/Sanity has none populated yet
  const defaultCategories = [
    { title: 'House Cleaning', slug: 'house-cleaning', icon: '<i class="fa-solid fa-broom"></i>', count: '140+ pros' },
    { title: 'Plumbing', slug: 'plumbing', icon: '<i class="fa-solid fa-wrench"></i>', count: '95+ pros' },
    { title: 'Electrical Repairs', slug: 'electrical-repairs', icon: '<i class="fa-solid fa-bolt"></i>', count: '110+ pros' },
    { title: 'Painting & Decorating', slug: 'painting-decorating', icon: '<i class="fa-solid fa-paint-roller"></i>', count: '75+ pros' },
    { title: 'Moving & Relocation', slug: 'moving-relocation', icon: '<i class="fa-solid fa-truck-moving"></i>', count: '60+ pros' },
    { title: 'Furniture Assembly', slug: 'furniture-assembly', icon: '<i class="fa-solid fa-couch"></i>', count: '85+ pros' },
    { title: 'Gardening', slug: 'gardening-landscaping', icon: '<i class="fa-solid fa-seedling"></i>', count: '50+ pros' },
    { title: 'Home Repairs', slug: 'appliance-home-repairs', icon: '<i class="fa-solid fa-screwdriver-wrench"></i>', count: '120+ pros' },
  ];

  const categoryMeta = {
    'house-cleaning': { icon: '<i class="fa-solid fa-broom"></i>', count: '140+ pros' },
    'plumbing': { icon: '<i class="fa-solid fa-wrench"></i>', count: '95+ pros' },
    'electrical-repairs': { icon: '<i class="fa-solid fa-bolt"></i>', count: '110+ pros' },
    'painting-decorating': { icon: '<i class="fa-solid fa-paint-roller"></i>', count: '75+ pros' },
    'moving-relocation': { icon: '<i class="fa-solid fa-truck-moving"></i>', count: '60+ pros' },
    'furniture-assembly': { icon: '<i class="fa-solid fa-couch"></i>', count: '85+ pros' },
    'gardening-landscaping': { icon: '<i class="fa-solid fa-seedling"></i>', count: '50+ pros' },
    'appliance-home-repairs': { icon: '<i class="fa-solid fa-screwdriver-wrench"></i>', count: '120+ pros' },
  };

  // Render categories
  if (categoriesGrid) {
    try {
      const data = await API.getCategories();
      const categories = (data && data.categories && data.categories.length > 0) ? data.categories : defaultCategories;
      categoriesGrid.innerHTML = categories.map((cat) => {
        const meta = categoryMeta[cat.slug] || { icon: '<i class="fa-solid fa-wrench"></i>', count: 'Available in Accra' };
        const icon = meta.icon;
        const count = meta.count;
        return `
          <a href="/categories/${cat.slug}" class="category-card">
            <div class="category-card-icon">${icon}</div>
            <div class="category-card-name">${cat.title}</div>
            <div class="category-card-count">${count}</div>
          </a>
        `;
      }).join('');
    } catch (err) {
      console.warn('Using default categories fallback', err);
      categoriesGrid.innerHTML = defaultCategories.map(cat => `
        <a href="/categories/${cat.slug}" class="category-card">
          <div class="category-card-icon">${cat.icon}</div>
          <div class="category-card-name">${cat.title}</div>
          <div class="category-card-count">${cat.count}</div>
        </a>
      `).join('');
    }
  }

  // Render featured services
  if (servicesGrid) {
    try {
      const data = await API.searchServices();
      let services = (data && data.services && data.services.length > 0) ? data.services : null;

      if (!services) {
        // High quality curated demo services matching screenshots
        services = [
          {
            _id: 'demo_1',
            title: 'Professional Deep Home & Apartment Cleaning',
            slug: 'professional-deep-home-cleaning',
            coverImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
            startingPrice: 150,
            currency: 'GH₵',
            categoryTitle: 'House Cleaning',
            provider: {
              displayName: 'Kofi Owusu',
              rating: 4.9,
              completedJobsCount: 84,
              photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
            }
          },
          {
            _id: 'demo_2',
            title: 'Emergency Plumbing, Pipe Repairs & Drain Unblocking',
            slug: 'emergency-plumbing-pipe-repairs',
            coverImageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&auto=format&fit=crop&q=80',
            startingPrice: 200,
            currency: 'GH₵',
            categoryTitle: 'Plumbing',
            provider: {
              displayName: 'Kwabena Mensah',
              rating: 4.8,
              completedJobsCount: 112,
              photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
            }
          },
          {
            _id: 'demo_3',
            title: 'Certified Residential Electrical Wiring & Installation',
            slug: 'residential-electrical-wiring',
            coverImageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
            startingPrice: 180,
            currency: 'GH₵',
            categoryTitle: 'Electrical Repairs',
            provider: {
              displayName: 'Emmanuel Boateng',
              rating: 5.0,
              completedJobsCount: 65,
              photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80'
            }
          },
          {
            _id: 'demo_4',
            title: 'Full Interior & Exterior House Painting Services',
            slug: 'interior-exterior-house-painting',
            coverImageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
            startingPrice: 350,
            currency: 'GH₵',
            categoryTitle: 'Painting & Decorating',
            provider: {
              displayName: 'Akosua Frimpong',
              rating: 4.9,
              completedJobsCount: 43,
              photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
            }
          },
          {
            _id: 'demo_5',
            title: 'Careful Furniture Moving & Relocation Assistance',
            slug: 'careful-furniture-moving',
            coverImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
            startingPrice: 280,
            currency: 'GH₵',
            categoryTitle: 'Moving & Relocation',
            provider: {
              displayName: 'Yaw Asante',
              rating: 4.7,
              completedJobsCount: 97,
              photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80'
            }
          },
          {
            _id: 'demo_6',
            title: 'Precision IKEA & Flat-Pack Furniture Assembly',
            slug: 'ikea-flatpack-furniture-assembly',
            coverImageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?w=600&auto=format&fit=crop&q=80',
            startingPrice: 120,
            currency: 'GH₵',
            categoryTitle: 'Furniture Assembly',
            provider: {
              displayName: 'Samuel Osei',
              rating: 4.9,
              completedJobsCount: 52,
              photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80'
            }
          }
        ];
      }

      const featured = services.slice(0, 8);
      servicesGrid.innerHTML = featured.map(s => Components.renderServiceCard(s)).join('');
    } catch (err) {
      console.error('Failed to load services:', err);
      servicesGrid.innerHTML = '<div class="empty-state"><p>Unable to load featured services right now.</p></div>';
    }
  }

  // Hero search form handling
  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = heroSearchForm.querySelector('input').value.trim();
      if (query) {
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      } else {
        window.location.href = '/search';
      }
    });
  }
});
