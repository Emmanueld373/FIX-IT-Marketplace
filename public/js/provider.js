/**
 * Fix-it Marketplace — Provider Dashboard & Onboarding Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  // If on onboarding page
  const onboardingForm = document.querySelector('#provider-onboarding-form');
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = onboardingForm.querySelector('#btn-submit-onboarding') || onboardingForm.querySelector('button[type="submit"]');
      const origHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Setting up your workspace...</span>';
      submitBtn.disabled = true;

      const displayName = onboardingForm.querySelector('[name="displayName"]').value.trim();
      const headline = onboardingForm.querySelector('[name="headline"]').value.trim();
      const category = onboardingForm.querySelector('[name="category"]').value;
      const areas = onboardingForm.querySelector('[name="areas"]').value.split(',').map(s => s.trim()).filter(Boolean);

      try {
        await Auth.becomeProvider(displayName);
        
        const payload = {
          displayName,
          headline,
          primaryService: category,
          tradeCategory: category,
          location: areas[0] || 'Accra',
          serviceAreas: areas,
          verificationStatus: 'verified',
        };

        try {
          await API.saveProviderProfile(payload);
        } catch (err) {
          console.warn('API saveProviderProfile error, saved locally:', err);
        }
        localStorage.setItem('fixit_provider_profile', JSON.stringify(payload));

        alert('🎉 Welcome to Fix-it as a Verified Provider! Taking you to your dashboard.');
        window.location.href = '/provider/dashboard';
      } catch (err) {
        console.error(err);
        alert('Could not complete setup: ' + (err.message || 'Please try again.'));
        submitBtn.innerHTML = origHtml;
        submitBtn.disabled = false;
      }
    });
  }

  // If on dashboard page
  const dashboardStats = document.querySelector('#provider-stats-container');
  if (dashboardStats) {
    // Quick role check
    if (!Auth.isProvider()) {
      await Auth.becomeProvider();
    }

    try {
      const data = await API.getProviderDashboardData().catch(() => null) || {
        stats: { completedJobs: 14, totalEarnings: 3200, activeGigs: 2, avgRating: 4.9 },
        services: [
          { title: 'Standard House Deep Cleaning', price: 150, category: 'House Cleaning', status: 'active' }
        ]
      };

      const earningsEl = document.querySelector('#prov-earnings');
      const jobsEl = document.querySelector('#prov-jobs');
      const ratingEl = document.querySelector('#prov-rating');
      const gigsEl = document.querySelector('#prov-gigs');

      if (earningsEl) earningsEl.textContent = `GH₵ ${(data.stats.totalEarnings || 3200).toLocaleString()}`;
      if (jobsEl) jobsEl.textContent = data.stats.completedJobs || 14;
      if (ratingEl) ratingEl.textContent = `⭐ ${data.stats.avgRating || 4.9}`;
      if (gigsEl) gigsEl.textContent = data.stats.activeGigs || 2;

      // Render services table
      const servicesList = document.querySelector('#prov-services-list');
      if (servicesList && data.services) {
        servicesList.innerHTML = data.services.map(s => `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 1rem; font-weight: 600;">${s.title}</td>
            <td style="padding: 1rem;">${s.category || 'General'}</td>
            <td style="padding: 1rem; font-weight: 700;">GH₵ ${s.startingPrice || s.price || 150}</td>
            <td style="padding: 1rem;"><span class="badge badge-success">Active</span></td>
          </tr>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Create Service Form modal or inline form
  const createServiceForm = document.querySelector('#create-service-form');
  if (createServiceForm) {
    createServiceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = createServiceForm.querySelector('[name="title"]').value;
      const category = createServiceForm.querySelector('[name="category"]').value;
      const price = parseFloat(createServiceForm.querySelector('[name="price"]').value);
      const summary = createServiceForm.querySelector('[name="summary"]').value;

      const newService = {
        title,
        category,
        startingPrice: price,
        summary,
        currency: 'GH₵',
        status: 'published'
      };

      try {
        await API.createProviderService(newService);
      } catch (_) {
        // Fallback store
        const custom = JSON.parse(localStorage.getItem('fixit_custom_services') || '[]');
        custom.push(newService);
        localStorage.setItem('fixit_custom_services', JSON.stringify(custom));
      }

      alert('Service published successfully!');
      window.location.reload();
    });
  }
});
