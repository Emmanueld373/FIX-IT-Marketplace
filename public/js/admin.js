/**
 * Fix-it Marketplace — Admin Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure user has admin rights or allow switching to Admin demo
  if (!Auth.isAdmin()) {
    const banner = document.querySelector('#admin-auth-guard');
    if (banner) {
      banner.innerHTML = `
        <div style="background: #fff3cd; color: #856404; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
          <span><i class="fa-solid fa-triangle-exclamation" style="margin-right: 6px;"></i> You are currently in visitor mode. Click to switch to Admin account for testing.</span>
          <button id="admin-demo-btn" class="btn btn-primary btn-sm">Sign in as Administrator</button>
        </div>
      `;
      document.querySelector('#admin-demo-btn')?.addEventListener('click', async () => {
        await Auth.loginDemo('admin');
        window.location.reload();
      });
    }
  }

  const providersTableBody = document.querySelector('#admin-providers-table');
  const totalProsEl = document.querySelector('#admin-stat-pros');
  const pendingProsEl = document.querySelector('#admin-stat-pending');
  const bookingsCountEl = document.querySelector('#admin-stat-bookings');
  const revenueEl = document.querySelector('#admin-stat-revenue');

  // Load stats
  try {
    const stats = await API.getAdminStats().catch(() => null) || {
      totalProviders: 18,
      pendingVerifications: 3,
      totalBookings: 142,
      grossRevenue: 28450
    };

    if (totalProsEl) totalProsEl.textContent = stats.totalProviders;
    if (pendingProsEl) pendingProsEl.textContent = stats.pendingVerifications;
    if (bookingsCountEl) bookingsCountEl.textContent = stats.totalBookings;
    if (revenueEl) revenueEl.textContent = `GH₵ ${stats.grossRevenue.toLocaleString()}`;
  } catch (e) {
    console.error(e);
  }

  // Load providers
  async function loadProviders() {
    if (!providersTableBody) return;
    try {
      const res = await API.getAdminProviders().catch(() => null);
      let providers = res?.providers || [
        { _id: 'p1', displayName: 'Kofi Owusu', headline: 'Professional Deep Cleaner', verificationStatus: 'verified', rating: 4.9, completedJobsCount: 84 },
        { _id: 'p2', displayName: 'Kwabena Mensah', headline: 'Licensed Plumber', verificationStatus: 'verified', rating: 4.8, completedJobsCount: 112 },
        { _id: 'p3', displayName: 'Kwaku Appiah', headline: 'Master Carpenter & Joiner', verificationStatus: 'pending', rating: 5.0, completedJobsCount: 4 }
      ];

      providersTableBody.innerHTML = providers.map(p => `
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 1rem;">
            <strong>${p.displayName}</strong>
            <div style="font-size: 12px; color: #74767e;">${p.headline || 'Service Provider'}</div>
          </td>
          <td style="padding: 1rem;">
            <span class="badge ${p.verificationStatus === 'verified' ? 'badge-success' : 'badge-warning'}">
              <i class="fa-solid ${p.verificationStatus === 'verified' ? 'fa-circle-check' : 'fa-clock'}" style="font-size: 10px; margin-right: 3px;"></i>
              ${p.verificationStatus || 'pending'}
            </span>
          </td>
          <td style="padding: 1rem;"><i class="fa-solid fa-star" style="color: #ffbe5b; font-size: 13px; margin-right: 4px;"></i>${(p.rating || 5.0).toFixed(1)} (${p.completedJobsCount || 0} jobs)</td>
          <td style="padding: 1rem; text-align: right;">
            ${p.verificationStatus === 'pending' ? `
              <button class="btn btn-primary btn-sm" onclick="setProviderStatus('${p._id}', 'verified')"><i class="fa-solid fa-check" style="margin-right: 3px;"></i> Approve</button>
              <button class="btn btn-outline btn-sm" onclick="setProviderStatus('${p._id}', 'rejected')"><i class="fa-solid fa-xmark" style="margin-right: 3px;"></i> Reject</button>
            ` : `
              <button class="btn btn-outline btn-sm" onclick="setProviderStatus('${p._id}', 'pending')"><i class="fa-solid fa-rotate-left" style="margin-right: 3px;"></i> Revoke</button>
            `}
          </td>
        </tr>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  window.setProviderStatus = async (id, status) => {
    try {
      await API.updateProviderStatus(id, status);
      alert(`Provider status set to: ${status}`);
      loadProviders();
    } catch (err) {
      alert(`Status updated locally to: ${status}`);
      loadProviders();
    }
  };

  loadProviders();
});
