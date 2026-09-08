/**
 * Fix-it Marketplace — Bookings Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const listContainer = document.querySelector('#bookings-list');
  const tabs = document.querySelectorAll('.tab-btn');
  let currentFilter = 'all';

  async function loadBookings() {
    if (!listContainer) return;
    listContainer.innerHTML = '<div style="text-align: center; padding: 3rem;"><div class="spinner"></div></div>';

    let bookings = [];
    try {
      const res = await API.getBookings();
      bookings = res?.bookings || [];
    } catch (_) {
      // Local fallback
      bookings = JSON.parse(localStorage.getItem('fixit_bookings') || '[]');
    }

    // Combine any stored local bookings
    const local = JSON.parse(localStorage.getItem('fixit_bookings') || '[]');
    const existingIds = new Set(bookings.map(b => b._id || b.id));
    local.forEach(b => {
      if (!existingIds.has(b._id || b.id)) bookings.unshift(b);
    });

    if (bookings.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="padding: 4rem 1rem;">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-title">No bookings yet</div>
          <div class="empty-state-desc">You haven't booked any home services yet. Browse top-rated providers today!</div>
          <a href="/search" class="btn btn-primary" style="margin-top: 1rem;">Explore Services</a>
        </div>
      `;
      return;
    }

    const filtered = currentFilter === 'all' 
      ? bookings 
      : bookings.filter(b => (b.status || 'pending').toLowerCase() === currentFilter.toLowerCase());

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="padding: 3rem 1rem;">
          <div class="empty-state-title">No ${currentFilter} bookings</div>
          <div class="empty-state-desc">There are no bookings matching this status.</div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${filtered.map(b => {
          const status = (b.status || 'pending').toLowerCase();
          const badgeClass = status === 'confirmed' ? 'badge-success' : status === 'completed' ? 'badge-info' : status === 'cancelled' ? 'badge-danger' : 'badge-warning';
          const formattedDate = b.scheduledDate ? new Date(b.scheduledDate).toLocaleString() : 'Date not set';
          const bookingId = b._id || b.id;

          return `
            <div style="background: #fff; border: 1px solid #dadbdd; border-radius: 12px; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap; gap: 1rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 0.5rem;">
                  <span class="badge ${badgeClass}" style="text-transform: capitalize;">${status}</span>
                  <span style="font-size: 13px; color: #74767e;">ID: #${String(bookingId).slice(-6)}</span>
                </div>
                <h3 style="font-size: 1.125rem; font-weight: 700; color: #222325; margin-bottom: 0.25rem;">
                  ${b.serviceTitle || 'Home Service'}
                </h3>
                <div style="font-size: 14px; color: #404145; margin-bottom: 0.5rem;">
                  Provider: <strong>${b.providerName || 'Fix-it Pro'}</strong> • Package: <strong>${b.packageName || 'Standard'}</strong>
                </div>
                <div style="font-size: 13px; color: #74767e; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                  <span><i class="fa-regular fa-calendar" style="margin-right: 4px; color: var(--color-brand-green);"></i>${formattedDate}</span>
                  <span><i class="fa-solid fa-location-dot" style="margin-right: 4px; color: var(--color-brand-green);"></i>${b.location || 'Accra'}</span>
                </div>
              </div>

              <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem;">
                <div style="font-size: 1.25rem; font-weight: 800; color: #222325;">
                  ${b.currency || 'GH₵'} ${b.price || 150}
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  ${status === 'pending' || status === 'confirmed' ? `
                    <button class="btn btn-outline btn-sm" onclick="cancelBooking('${bookingId}')">Cancel</button>
                    <button class="btn btn-primary btn-sm" onclick="completeBooking('${bookingId}')">Mark Completed</button>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  window.cancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await API.updateBookingStatus(id, 'cancelled');
    } catch (_) {
      const local = JSON.parse(localStorage.getItem('fixit_bookings') || '[]');
      const item = local.find(b => (b._id || b.id) === id);
      if (item) item.status = 'cancelled';
      localStorage.setItem('fixit_bookings', JSON.stringify(local));
    }
    loadBookings();
  };

  window.completeBooking = async (id) => {
    try {
      await API.updateBookingStatus(id, 'completed');
    } catch (_) {
      const local = JSON.parse(localStorage.getItem('fixit_bookings') || '[]');
      const item = local.find(b => (b._id || b.id) === id);
      if (item) item.status = 'completed';
      localStorage.setItem('fixit_bookings', JSON.stringify(local));
    }
    loadBookings();
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter || 'all';
      loadBookings();
    });
  });

  loadBookings();
});
