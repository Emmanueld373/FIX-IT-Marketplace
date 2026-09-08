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

      // Real services from catalog
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
