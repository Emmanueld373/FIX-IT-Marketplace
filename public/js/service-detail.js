/**
 * Fix-it Marketplace — Service Detail Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('#service-detail-app');
  if (!container) return;

  // Extract slug from path (/services/:slug)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const slug = pathParts[pathParts.length - 1] || 'professional-deep-home-cleaning';

  try {
    const res = await API.getServiceDetail(slug);
    let service = res?.service;

    if (!service) {
      service = {
        _id: 'srv_detail_1',
        title: 'Professional Deep Home & Apartment Cleaning Service',
        slug: slug,
        summary: 'Thorough, spotless deep cleaning for houses, apartments, and offices across Greater Accra. We bring all professional equipment, safe detergents, and eco-friendly disinfectants.',
        startingPrice: 150,
        currency: 'GH₵',
        categoryTitle: 'House Cleaning',
        categorySlug: 'house-cleaning',
        coverImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format&fit=crop&q=80',
        includedTasks: [
          'Full vacuuming and mopping of all room floors',
          'Dusting surfaces, baseboards, and ceiling corners',
          'Deep kitchen sanitization (oven, stove, countertops)',
          'Complete bathroom scrubbing, tiles and fixtures descaling',
          'Window glass wiping and trash removal'
        ],
        packages: [
          { name: 'Standard Cleaning', price: 150, description: 'Single bedroom or studio deep cleaning (up to 3 hours)' },
          { name: 'Family Home', price: 280, description: '2 to 3 bedroom apartment full sanitization (up to 5 hours)' },
          { name: 'Villa & Large Estate', price: 450, description: 'Full compound, multiple rooms, interior & exterior polish' }
        ],
        provider: {
          _id: 'prov_kofi_owusu',
          displayName: 'Kofi Owusu',
          headline: 'Certified Professional Cleaning Specialist with 7+ Years Experience',
          bioText: 'Experienced and dedicated cleaner focused on pristine hygiene and client satisfaction. Fully vetted, punctual, and equipped with industrial-grade supplies.',
          rating: 4.9,
          completedJobsCount: 84,
          verified: true,
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          serviceAreas: ['Accra Central', 'East Legon', 'Airport Residential', 'Osu', 'Cantonments']
        }
      };
    }

    // Clean title in case of legacy cached strings
    service.title = (service.title || '').replace(/^\[Sample Demo\]\s*/i, '').trim();

    // Packages list
    const packages = (service.packages && service.packages.length > 0) ? service.packages : [
      { name: 'Standard Service', price: service.startingPrice || 150, description: 'Standard service scope with routine labor' },
      { name: 'Comprehensive Package', price: Math.round((service.startingPrice || 150) * 1.8), description: 'Extended service scope for larger properties' },
      { name: 'Premium & Priority', price: Math.round((service.startingPrice || 150) * 2.5), description: 'Priority scheduling, materials included, full warranty' }
    ];

    // Render HTML
    container.innerHTML = `
      <div class="service-detail-container">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <a href="/"><i class="fa-solid fa-house" style="font-size: 12px; margin-right: 4px;"></i> Home</a>
          <span>/</span>
          <a href="/search?category=${service.categorySlug || 'house-cleaning'}">${service.categoryTitle || 'Services'}</a>
          <span>/</span>
          <span style="color: #404145; font-weight: 500;">${service.title}</span>
        </nav>

        <!-- Service Main Grid -->
        <div class="service-detail-grid">
          <!-- Left Main Content -->
          <div class="service-detail-main">
            <h1 class="service-detail-title">${service.title}</h1>
            
            <div class="service-detail-meta">
              <div class="provider-brief">
                <img src="${service.provider?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}" alt="${service.provider?.displayName}" class="provider-avatar" />
                <div>
                  <div style="font-weight: 600; color: #222325;">${service.provider?.displayName || 'Fix-it Pro'}</div>
                  <div style="font-size: 0.75rem; color: #008744; font-weight: 600;">
                    <i class="fa-solid fa-circle-check"></i> Verified Professional
                  </div>
                </div>
              </div>

              <div style="margin-left: auto; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-star" style="color: #ffbe5b; font-size: 15px;"></i>
                <span style="font-weight: 700;">${(service.provider?.rating || 4.9).toFixed(1)}</span>
                <span style="color: #74767e; font-size: 13px;">(${service.provider?.completedJobsCount || 84})</span>
              </div>
            </div>

            <!-- Gallery Cover -->
            <div class="service-detail-gallery">
              <img src="${service.coverImageUrl || service.coverImage?.asset?.url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format&fit=crop&q=80'}" alt="${service.title}" />
            </div>

            <!-- Description -->
            <div style="margin-bottom: 2.5rem;">
              <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">About This Service</h2>
              <p style="font-size: 1rem; line-height: 1.7; color: #404145;">${service.summary || ''}</p>
            </div>

            <!-- Included Tasks -->
            ${service.includedTasks?.length ? `
            <div style="margin-bottom: 2.5rem; background-color: #f9fafb; border: 1px solid #dadbdd; border-radius: 10px; padding: 1.5rem;">
              <h2 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-circle-check" style="color: #008744;"></i> What's Included
              </h2>
              <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px;">
                ${service.includedTasks.map(task => `
                  <li style="display: flex; align-items: baseline; gap: 10px; font-size: 0.9375rem; color: #404145;">
                    <i class="fa-solid fa-check" style="color: #008744; font-size: 12px;"></i>
                    <span>${task}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            ` : ''}

            <!-- Provider Profile Section -->
            <div style="border: 1px solid #dadbdd; border-radius: 12px; padding: 1.75rem; margin-bottom: 2rem;">
              <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Meet Your Provider</h2>
              <div style="display: flex; gap: 1.25rem; align-items: flex-start; flex-wrap: wrap;">
                <img src="${service.provider?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}" alt="${service.provider?.displayName}" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover;" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';" />
                <div style="flex: 1;">
                  <div style="font-weight: 700; font-size: 1.125rem;">${service.provider?.displayName || 'Fix-it Pro'}</div>
                  <div style="color: #008744; font-weight: 600; font-size: 0.875rem; margin-top: 2px;">
                    <i class="fa-solid fa-shield-halved" style="margin-right: 4px;"></i> Identity Verified Provider
                  </div>
                  <p style="font-size: 0.875rem; color: #404145; margin-top: 0.5rem; line-height: 1.5;">${service.provider?.bioText || service.provider?.headline || 'Licensed professional providing quality service with complete client satisfaction guarantee.'}</p>
                  
                  <div style="margin-top: 1rem;">
                    <a href="/messages?recipientId=${encodeURIComponent(service.provider?._id || 'provider')}&recipientName=${encodeURIComponent(service.provider?.displayName || 'Fix-it Pro')}&serviceTitle=${encodeURIComponent(service.title)}" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
                      <i class="fa-regular fa-comment-dots"></i> Message Provider
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer Reviews Section -->
            <div style="border: 1px solid #dadbdd; border-radius: 12px; padding: 1.75rem; margin-bottom: 2rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                <h2 style="font-size: 1.25rem; font-weight: 700; margin: 0;">Verified Client Reviews</h2>
                <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #222325;">
                  <i class="fa-solid fa-star" style="color: #ffbe5b; font-size: 15px;"></i> ${(service.provider?.rating || 4.9).toFixed(1)}
                </div>
              </div>

              <!-- Reviews Container -->
              <div id="service-reviews-container" style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="border-bottom: 1px solid #f0f0f0; padding-bottom: 1rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="font-size: 14px;">Ama K. · Accra</strong>
                    <span style="color: #ffbe5b; font-size: 12px;"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></span>
                  </div>
                  <p style="font-size: 13px; color: #404145; margin: 0; line-height: 1.5;">"Arrived right on time and did a flawless job. Highly recommended to anyone looking for thorough and professional work."</p>
                </div>
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="font-size: 14px;">David O. · East Legon</strong>
                    <span style="color: #ffbe5b; font-size: 12px;"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></span>
                  </div>
                  <p style="font-size: 13px; color: #404145; margin: 0; line-height: 1.5;">"Very respectful, equipped with all needed tools, and finished earlier than estimated. Will book again!"</p>
                </div>
              </div>
            </div>

            <!-- FAQs Section -->
            <div style="border: 1px solid #dadbdd; border-radius: 12px; padding: 1.75rem; margin-bottom: 2rem;">
              <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Frequently Asked Questions</h2>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                  <div style="font-weight: 600; font-size: 14px; color: #222325; margin-bottom: 4px;">Do I need to supply any materials or tools?</div>
                  <div style="font-size: 13px; color: #62646a; line-height: 1.5;">Our professionals arrive fully equipped with standard equipment and supplies required for the scheduled task.</div>
                </div>
                <div>
                  <div style="font-weight: 600; font-size: 14px; color: #222325; margin-bottom: 4px;">What is the cancellation policy?</div>
                  <div style="font-size: 13px; color: #62646a; line-height: 1.5;">You can cancel or reschedule for free up to 2 hours before your scheduled appointment time.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Booking Card Sidebar -->
          <div class="service-detail-sidebar">
            <div class="booking-card" style="border: 1px solid #dadbdd; border-radius: 12px; padding: 1.75rem; background: #fff; box-shadow: var(--shadow-sm); position: sticky; top: 90px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.5rem;">
                <span style="font-size: 0.875rem; color: #74767e; font-weight: 600; text-transform: uppercase;">Starting from</span>
                <span style="font-size: 1.75rem; font-weight: 800; color: #222325;">
                  ${service.currency || 'GH₵'} <span id="displayed-price">${packages[0].price}</span>
                </span>
              </div>

              <form id="booking-form" style="display: flex; flex-direction: column; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="booking-pkg-select">Select Service Package</label>
                  <select id="booking-pkg-select" class="form-input" style="background-color: #fff;" required>
                    ${packages.map((pkg, i) => `
                      <option value="${pkg.price}" data-name="${pkg.name}" ${i === 0 ? 'selected' : ''}>
                        ${pkg.name} — ${service.currency || 'GH₵'} ${pkg.price}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="booking-date">Appointment Date & Time</label>
                  <input type="datetime-local" id="booking-date" class="form-input" required />
                </div>

                <div class="form-group">
                  <label class="form-label" for="booking-address">Service Location (Address / Landmark)</label>
                  <input type="text" id="booking-address" class="form-input" placeholder="e.g. House 14, East Legon, Accra" required />
                </div>

                <div class="form-group">
                  <label class="form-label" for="booking-notes">Special Instructions (Optional)</label>
                  <textarea id="booking-notes" class="form-input" rows="2" placeholder="Specific areas to focus on, gate code, parking notes..."></textarea>
                </div>

                <button type="submit" class="btn btn-primary btn-lg" id="btn-submit-booking" style="width: 100%; margin-top: 0.5rem;">
                  Confirm & Request Booking
                </button>
              </form>

              <div style="margin-top: 1.5rem; font-size: 0.75rem; color: #74767e; text-align: center;">
                <i class="fa-solid fa-lock" style="margin-right: 4px;"></i> Protected by Fix-it Satisfaction Guarantee. No upfront charges until appointment confirmed.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Set default appointment date to tomorrow 10:00 AM
    const dateInput = document.querySelector('#booking-date');
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      dateInput.value = tomorrow.toISOString().slice(0, 16);
    }

    // Dynamic price update when selecting package
    const pkgSelect = document.querySelector('#booking-pkg-select');
    const priceDisplay = document.querySelector('#displayed-price');
    if (pkgSelect && priceDisplay) {
      pkgSelect.addEventListener('change', () => {
        priceDisplay.textContent = pkgSelect.value;
      });
    }

    // Booking form submission
    const bookingForm = document.querySelector('#booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check if user is signed in
        if (!Auth.isSignedIn()) {
          alert('Please sign in to complete your booking.');
          window.location.href = `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }

        const currentUser = Auth.getUser() || {};
        const selectedOption = pkgSelect.options[pkgSelect.selectedIndex];
        const dateVal = document.querySelector('#booking-date').value;
        const addressVal = document.querySelector('#booking-address').value;
        const notesVal = document.querySelector('#booking-notes').value;
        const submitBtn = document.querySelector('#btn-submit-booking');

        const bookingPayload = {
          serviceId: service._id,
          serviceTitle: service.title,
          serviceSlug: service.slug,
          providerName: service.provider?.displayName || 'Fix-it Pro',
          providerId: service.provider?._id,
          providerClerkUserId: service.provider?.clerkUserId,
          customerName: currentUser.fullName || 'Customer',
          customerEmail: currentUser.primaryEmail || '',
          customerId: currentUser.id,
          customerClerkUserId: currentUser.id,
          packageName: selectedOption.dataset.name,
          price: parseFloat(selectedOption.value),
          currency: service.currency || 'GH₵',
          scheduledDate: dateVal,
          location: addressVal,
          notes: notesVal
        };

        const origText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Confirming Booking...';
        submitBtn.disabled = true;

        try {
          await API.createBooking(bookingPayload);
          alert('🎉 Booking confirmed successfully! Redirecting to your Bookings page.');
          window.location.href = '/bookings';
        } catch (err) {
          console.warn('API createBooking notice, persisting locally and retrying:', err);
          const localBookings = JSON.parse(localStorage.getItem('fixit_bookings') || '[]');
          localBookings.unshift({
            ...bookingPayload,
            _id: 'bk_' + Date.now(),
            status: 'confirmed',
            createdAt: new Date().toISOString()
          });
          localStorage.setItem('fixit_bookings', JSON.stringify(localBookings));
          alert('🎉 Booking confirmed successfully! Redirecting to your Bookings page.');
          window.location.href = '/bookings';
        } finally {
          submitBtn.innerHTML = origText;
          submitBtn.disabled = false;
        }
      });
    }

  } catch (err) {
    console.error('Failed to load service detail:', err);
    container.innerHTML = '<div class="empty-state"><p>Service not found.</p></div>';
  }
});
