/**
 * Fix-it Marketplace — Category Page Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const pathParts = window.location.pathname.split('/');
  const slug = pathParts[pathParts.length - 1] || 'house-cleaning';

  const categoryNameEl = document.querySelector('#category-title');
  const categoryDescEl = document.querySelector('#category-desc');
  const servicesGrid = document.querySelector('#category-services-grid');

  try {
    const res = await API.getCategoryDetail(slug).catch(() => null);
    const category = res?.category || {
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `Browse verified professionals offering high quality ${slug.replace(/-/g, ' ')} across Ghana.`
    };

    if (categoryNameEl) categoryNameEl.textContent = category.title;
    if (categoryDescEl) categoryDescEl.textContent = category.description;

    let services = res?.services || [];
    if (services.length === 0) {
      // Fallback services
      const allRes = await API.searchServices({ category: slug }).catch(() => null);
      services = allRes?.services || [];
    }

    if (!servicesGrid) return;

    if (services.length === 0) {
      servicesGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 4rem 1rem;">
          <div class="empty-state-icon"><i class="fa-solid fa-toolbox" style="font-size: 2.5rem; color: #d1d5db; margin-bottom: 0.5rem;"></i></div>
          <div class="empty-state-title">No services in this category yet</div>
          <div class="empty-state-desc">Be the first professional to offer services here!</div>
          <a href="/provider/onboarding" class="btn btn-primary" style="margin-top: 1rem;">Become a Provider</a>
        </div>
      `;
      return;
    }

    servicesGrid.innerHTML = services.map(s => Components.renderServiceCard(s)).join('');
  } catch (err) {
    console.error('Error loading category:', err);
  }
});
