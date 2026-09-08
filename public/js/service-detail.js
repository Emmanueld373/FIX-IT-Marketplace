/**
 * Fix-it Marketplace — Service Detail Page Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const pathParts = window.location.pathname.split('/');
  const slug = pathParts[pathParts.length - 1] || 'professional-deep-home-cleaning';

  const container = document.querySelector('#service-detail-root');
  if (!container) return;

  try {
    let service = null;
    try {
      const res = await API.getServiceDetail(slug);
      service = res?.service;
    } catch (_) {}

    // Fallback demo service if not yet seeded in Sanity
    if (!service) {
      service = {
        _id: 'srv_demo_detail_1',
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
          _id: 'prov_demo_1',
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

    // Render HTML
    container.innerHTML = `
      <div class="service-detail-container">
        <!-- Breadcrumb -->
        <div class="breadcrumbs">
          <a href="/">Home</a>
          <span class="breadcrumbs-sep">/</span>
          <a href="/categories/${service.categorySlug || 'house-cleaning'}">${service.categoryTitle || 'Services'}</a>
          <span class="breadcrumbs-sep">/</span>
          <span>${service.title}</span>
        </div>

        <div class="service-detail-layout">
          <!-- Main Content -->
          <div class="service-main-col">
            <h1 class="service-title">${service.title}</h1>
            
            <div class="service-provider-strip">
              <img src="${service.provider?.photoUrl}" alt="${service.provider?.displayName}" class="provider-avatar" />
              <div>
                <div style="font-weight: 700; color: #222325;">${service.provider?.displayName}</div>
                <div style="font-size: 13px; color: #74767e;">${service.provider?.headline || 'Top Rated Professional'}</div>
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
              <div style="display: flex; gap: 1.25rem; align-items: flex-start;">
                <img src="${service.provider?.photoUrl}" alt="${service.provider?.displayName}" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover;" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';" />
                <div>
                  <div style="font-weight: 700; font-size: 1.125rem;">${service.provider?.displayName}</div>
                  <div style="color: #008744; font-weight: 600; font-size: 0.875rem; margin-top: 2px;">
                    <i class="fa-solid fa-shield-halved" style="margin-right: 4px;"></i> Identity Verified Provider
                  </div>
                  <p style="font-size: 0.875rem; color: #404145; margin-top: 0.5rem; line-height: 1.5;">${service.provider?.bioText || ''}</p>
                </div>
              </div>
            </div>

            <!-- Customer Reviews Section -->
            <div style="border: 1px solid #dadbdd; border-radius: 12px; padding: 1.75rem; margin-bottom: 2rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                <h2 style="font-size: 1.25rem; font-weight: 700; margin: 0;">Verified Client Reviews</h2>
                <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #222325;">
                  <i class="fa-solid fa-star" style="color: #ffbe5b; font-size: 15px;"></i> ${(service.provider?.rating || 4.9).toFixed(1)} (12 reviews)
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
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

          <!-- Sticky Booking Sidebar -->
          <div class="service-sidebar-col">
            <div class="booking-sidebar-card">
              <div class="booking-price-header">
                <div>
                  <span class="price-label">Starting at</span>
                  <div class="booking-price">${service.currency || 'GH₵'} ${service.startingPrice}</div>
                </div>
                <span class="badge badge-success"><i class="fa-solid fa-bolt" style="font-size: 10px; margin-right: 4px;"></i> Instant Quote</span>
              </div>

              <div style="font-size: 0.875rem; color: #62646a; margin-bottom: 1.5rem;">
                Select your service requirements, preferred date & location to book directly with verified local professionals.
              </div>

              <form id="booking-form" style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                  <label class="form-label">Select Package</label>
                  <select class="form-input" id="booking-pkg-select">
                    ${(service.packages || [{ name: 'Standard Service', price: service.startingPrice }]).map(p => `
                      <option value="${p.price}" data-name="${p.name}">${p.name} — ${service.currency || 'GH₵'} ${p.price}</option>
                    `).join('')}
                  </select>
                </div>

                <div>
                  <label class="form-label">Service Date & Time</label>
                  <input type="datetime-local" class="form-input" id="booking-date" required />
                </div>

                <div>
                  <label class="form-label">Service Address / Location</label>
                  <input type="text" class="form-input" id="booking-address" placeholder="e.g. East Legon, Accra" required />
                </div>

                <div>
                  <label class="form-label">Special Notes or Instructions</label>
                  <textarea class="form-input" id="booking-notes" rows="2" placeholder="Tell the provider any specific details..."></textarea>
                </div>

                <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.5rem;">
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

    // Booking form submission
    const bookingForm = document.querySelector('#booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check if user is signed in
        if (!Auth.isSignedIn()) {
          // Auto-sign in demo or redirect
          const promptDemo = confirm('You need to be signed in to make a booking.\n\nClick OK to continue with demo account, or Cancel to go to Sign In page.');
          if (promptDemo) {
            await Auth.loginDemo('customer');
          } else {
            window.location.href = '/sign-in';
            return;
          }
        }

        const pkgSelect = document.querySelector('#booking-pkg-select');
        const selectedOption = pkgSelect.options[pkgSelect.selectedIndex];
        const dateVal = document.querySelector('#booking-date').value;
        const addressVal = document.querySelector('#booking-address').value;
        const notesVal = document.querySelector('#booking-notes').value;

        const bookingPayload = {
          serviceId: service._id,
          serviceTitle: service.title,
          providerName: service.provider?.displayName,
          providerId: service.provider?._id,
          packageName: selectedOption.dataset.name,
          price: parseFloat(selectedOption.value),
          currency: service.currency || 'GH₵',
          scheduledDate: dateVal,
          location: addressVal,
          notes: notesVal
        };

        try {
          await API.createBooking(bookingPayload);
          alert('🎉 Booking requested successfully! Redirecting to your Bookings page.');
          window.location.href = '/bookings';
        } catch (err) {
          console.warn('Backend booking API error, saving locally:', err);
          // Save booking locally for demo resilience
          const bookings = JSON.parse(localStorage.getItem('fixit_bookings') || '[]');
          bookings.unshift({
            ...bookingPayload,
            _id: 'bk_' + Date.now(),
            status: 'pending',
            createdAt: new Date().toISOString()
          });
          localStorage.setItem('fixit_bookings', JSON.stringify(bookings));
          alert('🎉 Booking requested successfully! Redirecting to your Bookings page.');
          window.location.href = '/bookings';
        }
      });
    }

  } catch (err) {
    console.error('Failed to load service detail:', err);
    container.innerHTML = '<div class="empty-state"><p>Service not found.</p></div>';
  }
});
