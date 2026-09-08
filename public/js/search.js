/**
 * Fix-it Marketplace — Search & Catalog Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get('q') || '';
  const category = urlParams.get('category') || '';
  const location = urlParams.get('location') || '';
  const minPrice = urlParams.get('minPrice') || '';
  const maxPrice = urlParams.get('maxPrice') || '';
  const sort = urlParams.get('sort') || 'relevance';

  const resultsGrid = document.querySelector('#search-results-grid');
  const searchCountEl = document.querySelector('#search-count');
  const queryDisplayEl = document.querySelector('#search-query-display');
  const sortSelect = document.querySelector('#search-sort-select');

  if (queryDisplayEl) {
    if (q) queryDisplayEl.textContent = `Results for "${q}"`;
    else if (category) queryDisplayEl.textContent = `Browsing ${category.replace('-', ' ')}`;
    else queryDisplayEl.textContent = 'All Available Services';
  }

  if (sortSelect) {
    sortSelect.value = sort;
    sortSelect.addEventListener('change', () => {
      urlParams.set('sort', sortSelect.value);
      window.location.search = urlParams.toString();
    });
  }

  // Load search results
  async function loadServices() {
    if (!resultsGrid) return;
    resultsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; display: flex; justify-content: center; padding: 3rem;">
        <div class="spinner"></div>
      </div>
    `;

    try {
      const res = await API.searchServices({ q, category, location, minPrice, maxPrice, sort });
      let services = res?.services || [];

      // If empty and searching with demo fallback
      if (services.length === 0) {
        // Create demo results matching query or default
        const sampleServices = [
          {
            _id: 'demo_1',
            title: 'Professional Deep Home & Apartment Cleaning',
            slug: 'professional-deep-home-cleaning',
            coverImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
            startingPrice: 150,
            currency: 'GH₵',
            categoryTitle: 'House Cleaning',
            categorySlug: 'house-cleaning',
            provider: { displayName: 'Kofi Owusu', rating: 4.9, completedJobsCount: 84, photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
          },
          {
            _id: 'demo_2',
            title: 'Emergency Plumbing, Pipe Repairs & Drain Unblocking',
            slug: 'emergency-plumbing-pipe-repairs',
            coverImageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&auto=format&fit=crop&q=80',
            startingPrice: 200,
            currency: 'GH₵',
            categoryTitle: 'Plumbing',
            categorySlug: 'plumbing',
            provider: { displayName: 'Kwabena Mensah', rating: 4.8, completedJobsCount: 112, photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' }
          },
          {
            _id: 'demo_3',
            title: 'Certified Residential Electrical Wiring & Installation',
            slug: 'residential-electrical-wiring',
            coverImageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
            startingPrice: 180,
            currency: 'GH₵',
            categoryTitle: 'Electrical Repairs',
            categorySlug: 'electrical-repairs',
            provider: { displayName: 'Emmanuel Boateng', rating: 5.0, completedJobsCount: 65, photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80' }
          },
          {
            _id: 'demo_4',
            title: 'Full Interior & Exterior House Painting Services',
            slug: 'interior-exterior-house-painting',
            coverImageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
            startingPrice: 350,
            currency: 'GH₵',
            categoryTitle: 'Painting & Decorating',
            categorySlug: 'painting-decorating',
            provider: { displayName: 'Akosua Frimpong', rating: 4.9, completedJobsCount: 43, photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' }
          }
        ];

        services = sampleServices.filter(s => {
          if (q && !s.title.toLowerCase().includes(q.toLowerCase()) && !s.categoryTitle.toLowerCase().includes(q.toLowerCase())) return false;
          if (category && s.categorySlug !== category) return false;
          return true;
        });
        if (services.length === 0 && !q && !category) services = sampleServices;
      }

      if (searchCountEl) {
        searchCountEl.textContent = `${services.length} services available`;
      }

      if (services.length === 0) {
        resultsGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1; padding: 4rem 1rem;">
            <div class="empty-state-icon"><i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: #d1d5db; margin-bottom: 0.5rem;"></i></div>
            <div class="empty-state-title">No services found</div>
            <div class="empty-state-desc">Try modifying your search keywords or clear your active filters.</div>
            <a href="/search" class="btn btn-outline" style="margin-top: 1rem;">Clear All Filters</a>
          </div>
        `;
        return;
      }

      resultsGrid.innerHTML = services.map(s => Components.renderServiceCard(s)).join('');
    } catch (err) {
      console.error(err);
      resultsGrid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><p>Failed to load services.</p></div>';
    }
  }

  loadServices();

  // Price filter apply button
  const filterForm = document.querySelector('#search-filter-form');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const minP = filterForm.querySelector('[name="minPrice"]')?.value;
      const maxP = filterForm.querySelector('[name="maxPrice"]')?.value;
      if (minP) urlParams.set('minPrice', minP); else urlParams.delete('minPrice');
      if (maxP) urlParams.set('maxPrice', maxP); else urlParams.delete('maxPrice');
      window.location.search = urlParams.toString();
    });
  }
});
