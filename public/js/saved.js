/**
 * Fix-it Marketplace — Saved Services Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('#saved-services-grid');
  if (!container) return;

  const savedIds = JSON.parse(localStorage.getItem('fixit_saved') || '[]');

  if (savedIds.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 4rem 1rem;">
        <div class="empty-state-icon"><i class="fa-regular fa-heart" style="font-size: 2.5rem; color: #d1d5db; margin-bottom: 0.5rem;"></i></div>
        <div class="empty-state-title">No saved services yet</div>
        <div class="empty-state-desc">Click the heart icon on any service card to save it for quick booking later.</div>
        <a href="/search" class="btn btn-primary" style="margin-top: 1rem;">Browse Marketplace</a>
      </div>
    `;
    return;
  }

  try {
    const res = await API.searchServices();
    const allServices = res?.services || [];
    const savedServices = allServices.filter(s => savedIds.includes(s._id || s.id));

    if (savedServices.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 3rem 1rem;">
          <div class="empty-state-title">Saved items unavailable</div>
          <div class="empty-state-desc">The services you saved are currently offline or updated.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = savedServices.map(s => Components.renderServiceCard(s)).join('');
  } catch (err) {
    console.error(err);
  }
});
