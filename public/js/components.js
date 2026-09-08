/**
 * Fix-it Marketplace — Shared Components Renderer
 */

const Components = {
  /**
   * Renders the universal Public Header into #main-header
   */
  renderHeader(containerSelector = '#main-header', options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const user = Auth.getUser();
    const isSignedIn = Auth.isSignedIn();
    const isProvider = Auth.isProvider();
    const isAdmin = Auth.isAdmin();

    const searchQuery = options.searchQuery || '';
    const showSearch = options.showSearch !== false;

    container.innerHTML = `
      <header class="header">
        <div class="header-container">
          <!-- Logo -->
          <a href="/" class="header-logo">
            <span class="logo-text">Fix it</span>
            <span class="logo-dot"></span>
          </a>

          <!-- Search Bar (desktop) -->
          ${showSearch ? `
          <form action="/search" method="GET" class="header-search-form">
            <div class="header-search-wrap">
              <input
                type="text"
                name="q"
                value="${searchQuery}"
                placeholder="What service do you need today?"
                class="header-search-input"
              />
              <button type="submit" aria-label="Search" class="header-search-btn">
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </form>
          ` : ''}

          <!-- Desktop Navigation -->
          <nav class="header-nav">
            ${isSignedIn && isProvider ? `
              <a href="/provider/dashboard" class="header-provider-link">Provider Dashboard</a>
            ` : `
              <a href="/provider/onboarding" class="header-provider-link">Become a Provider</a>
            `}

            ${isSignedIn ? `
              <div class="header-user-menu">
                <a href="/messages" class="header-icon-link" title="Messages">
                  <i class="fa-regular fa-envelope" style="font-size: 17px;"></i>
                </a>
                <a href="/saved" class="header-icon-link" title="Saved Services">
                  <i class="fa-regular fa-heart" style="font-size: 17px;"></i>
                </a>
                <a href="/bookings" style="font-weight: 600;">Bookings</a>
                ${isAdmin ? `
                  <a href="/admin" class="admin-chip">Admin</a>
                ` : ''}
                
                <!-- User Profile Dropdown -->
                <div style="position: relative;" id="user-menu-dropdown-wrap">
                  <button class="user-avatar-btn" id="user-avatar-trigger" title="${user.fullName}">
                    <img src="${user.imageUrl}" alt="${user.fullName}" class="user-avatar-img" />
                  </button>
                  <div id="user-dropdown-menu" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 8px; width: 180px; background: #fff; border: 1px solid #dadbdd; border-radius: 8px; box-shadow: var(--shadow-lg); padding: 6px 0; z-index: 100;">
                    <div style="padding: 8px 14px; border-bottom: 1px solid #f0f0f0;">
                      <div style="font-weight: 700; font-size: 13px; color: #222325;">${user.fullName}</div>
                      <div style="font-size: 11px; color: #74767e; text-overflow: ellipsis; overflow: hidden;">${user.primaryEmail}</div>
                    </div>
                    <a href="/provider/profile" style="display: block; padding: 8px 14px; font-size: 13px; color: #404145; text-decoration: none;">My Profile</a>
                    <a href="/bookings" style="display: block; padding: 8px 14px; font-size: 13px; color: #404145; text-decoration: none;">My Bookings</a>
                    <button id="header-signout-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 8px 14px; font-size: 13px; color: #ef4444; cursor: pointer; border-top: 1px solid #f0f0f0;">Sign Out</button>
                  </div>
                </div>
              </div>
            ` : `
              <div class="header-auth-group">
                <a href="/sign-in" class="btn btn-ghost btn-sm">Sign In</a>
                <a href="/sign-up" class="btn btn-primary btn-sm">Join</a>
              </div>
            `}
          </nav>

          <!-- Mobile Hamburger -->
          <button class="header-mobile-toggle" id="mobile-toggle-btn" aria-label="Toggle menu">
            <i class="fa-solid fa-bars" style="font-size: 20px;"></i>
          </button>
        </div>
      </header>

      <!-- Mobile Menu Drawer -->
      <div class="mobile-menu-overlay" id="mobile-menu-overlay"></div>
      <div class="mobile-menu-drawer" id="mobile-menu-drawer">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="logo-text">Fix it</span>
          <button class="mobile-menu-close" id="mobile-menu-close" aria-label="Close menu">
            <i class="fa-solid fa-xmark" style="font-size: 20px;"></i>
          </button>
        </div>
        <form action="/search" method="GET" style="margin-top: 10px;">
          <input type="text" name="q" placeholder="Search services..." class="form-input" />
        </form>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
          <a href="/" style="text-decoration: none; color: #222325; font-weight: 600;">Home</a>
          <a href="/search" style="text-decoration: none; color: #222325; font-weight: 600;">Explore All Services</a>
          <a href="/provider/onboarding" style="text-decoration: none; color: #008744; font-weight: 600;">Become a Provider</a>
          ${isSignedIn ? `
            <a href="/bookings" style="text-decoration: none; color: #222325;">My Bookings</a>
            <a href="/messages" style="text-decoration: none; color: #222325;">Messages</a>
            <a href="/saved" style="text-decoration: none; color: #222325;">Saved Services</a>
            ${isAdmin ? `<a href="/admin" style="text-decoration: none; color: #222325;">Admin Dashboard</a>` : ''}
            <button id="mobile-signout-btn" class="btn btn-outline btn-sm" style="margin-top: 20px;">Sign Out</button>
          ` : `
            <a href="/sign-in" class="btn btn-outline" style="margin-top: 12px;">Sign In</a>
            <a href="/sign-up" class="btn btn-primary">Join Fix it</a>
          `}
        </div>
      </div>
    `;

    // Dropdown toggle
    const avatarTrigger = document.querySelector('#user-avatar-trigger');
    const dropdownMenu = document.querySelector('#user-dropdown-menu');
    if (avatarTrigger && dropdownMenu) {
      avatarTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
      });
      document.addEventListener('click', () => {
        dropdownMenu.style.display = 'none';
      });
    }

    // Sign out handlers
    const signOutBtn = document.querySelector('#header-signout-btn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => Auth.signOut());
    }
    const mobileSignOut = document.querySelector('#mobile-signout-btn');
    if (mobileSignOut) {
      mobileSignOut.addEventListener('click', () => Auth.signOut());
    }

    // Mobile drawer toggle
    const toggleBtn = document.querySelector('#mobile-toggle-btn');
    const closeBtn = document.querySelector('#mobile-menu-close');
    const overlay = document.querySelector('#mobile-menu-overlay');
    const drawer = document.querySelector('#mobile-menu-drawer');

    const openDrawer = () => {
      overlay.classList.add('open');
      drawer.classList.add('open');
    };
    const closeDrawer = () => {
      overlay.classList.remove('open');
      drawer.classList.remove('open');
    };

    if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
  },

  /**
   * Renders the category horizontal sub-navbar
   */
  renderCategoryNav(containerSelector = '#category-nav', activeSlug = '') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const categories = [
      { slug: 'house-cleaning', title: 'House Cleaning' },
      { slug: 'plumbing', title: 'Plumbing' },
      { slug: 'electrical-repairs', title: 'Electrical Repairs' },
      { slug: 'painting-decorating', title: 'Painting & Decorating' },
      { slug: 'moving-relocation', title: 'Moving & Relocation' },
      { slug: 'furniture-assembly', title: 'Furniture Assembly' },
      { slug: 'gardening-landscaping', title: 'Gardening & Landscaping' },
      { slug: 'appliance-home-repairs', title: 'Home Repairs' },
    ];

    container.innerHTML = `
      <div class="category-navbar">
        <div class="category-navbar-container">
          ${categories.map(c => `
            <a href="/categories/${c.slug}" class="category-nav-item ${activeSlug === c.slug ? 'active' : ''}">
              ${c.title}
            </a>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Renders the universal Footer
   */
  renderFooter(containerSelector = '#main-footer') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = `
      <footer class="footer">
        <div class="footer-container">
          <div class="footer-grid">
            <div class="footer-column">
              <h4 class="footer-column-title">Categories</h4>
              <ul class="footer-links">
                <li><a href="/categories/house-cleaning">House Cleaning</a></li>
                <li><a href="/categories/plumbing">Plumbing</a></li>
                <li><a href="/categories/electrical-repairs">Electrical Repairs</a></li>
                <li><a href="/categories/painting-decorating">Painting</a></li>
                <li><a href="/categories/moving-relocation">Moving</a></li>
                <li><a href="/categories/furniture-assembly">Furniture Assembly</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h4 class="footer-column-title">For Customers</h4>
              <ul class="footer-links">
                <li><a href="/search">Find a Professional</a></li>
                <li><a href="#">How Fix it Works</a></li>
                <li><a href="#">Safety & Trust</a></li>
                <li><a href="#">Service Areas</a></li>
                <li><a href="#">Customer Support</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h4 class="footer-column-title">For Providers</h4>
              <ul class="footer-links">
                <li><a href="/provider/onboarding">Become a Provider</a></li>
                <li><a href="/provider/dashboard">Provider Dashboard</a></li>
                <li><a href="#">Success Stories</a></li>
                <li><a href="#">Community Guidelines</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h4 class="footer-column-title">Business Solutions</h4>
              <ul class="footer-links">
                <li><a href="#">Property Management</a></li>
                <li><a href="#">Real Estate Services</a></li>
                <li><a href="#">Bulk Bookings</a></li>
                <li><a href="#">Enterprise Support</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h4 class="footer-column-title">Company</h4>
              <ul class="footer-links">
                <li><a href="#">About Fix it</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 800; color: #222325; font-size: 16px;">Fix it.</span>
              <span>© ${new Date().getFullYear()} Fix it Marketplace. All rights reserved.</span>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
              <span>Language: <strong>English (GH)</strong></span>
              <span>Currency: <strong>GHS (GH₵)</strong></span>
            </div>
          </div>
        </div>
      </footer>
    `;
  },

  /**
   * Renders a single service card
   */
  renderServiceCard(service) {
    const rawTitle = service.title || 'Professional Service';
    const cleanTitle = rawTitle.replace(/^\[Sample Demo\]\s*/i, '');
    const cover = service.coverImageUrl || (service.coverImage?.asset?.url) || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80';
    const providerPhoto = service.provider?.photoUrl || (service.provider?.photo?.asset?.url) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
    const providerName = service.provider?.displayName || 'Fix-it Professional';
    const rating = (service.provider?.rating || 4.9).toFixed(1);
    const jobsCount = service.provider?.completedJobsCount || 18;
    const price = service.startingPrice || 120;
    const currency = (service.currency === 'GHS' || !service.currency) ? 'GH₵' : service.currency;
    const categoryTitle = service.categoryTitle || 'Home Service';

    const savedList = JSON.parse(localStorage.getItem('fixit_saved') || '[]');
    const isSaved = savedList.includes(service._id);

    return `
      <div class="service-card" data-service-id="${service._id}">
        <div class="service-card-image-wrap">
          <a href="/services/${service.slug}">
            <img src="${cover}" alt="${cleanTitle}" class="service-card-image" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80';" />
          </a>
          <button class="service-card-like ${isSaved ? 'saved' : ''}" onclick="Components.toggleSave('${service._id}', event)" title="Save service">
            <i class="${isSaved ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}" style="${isSaved ? 'color: #e11d48;' : ''}"></i>
          </button>
        </div>
        <div class="service-card-body">
          <div class="service-card-provider">
            <img src="${providerPhoto}" alt="${providerName}" class="service-card-provider-img" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';" />
            <div class="service-card-provider-info">
              <span class="service-card-provider-name">${providerName}</span>
              <span class="badge badge-verified"><i class="fa-solid fa-circle-check" style="font-size: 10px;"></i> Verified Pro</span>
            </div>
          </div>
          <a href="/services/${service.slug}" class="service-card-title">
            ${cleanTitle}
          </a>
          <div class="service-card-rating">
            <i class="fa-solid fa-star star-icon"></i>
            <span class="rating-val">${rating}</span>
            <span class="rating-count">(${jobsCount})</span>
          </div>
          <div class="service-card-footer">
            <span class="price-label">Starting at</span>
            <span class="price-val">${currency} ${price}</span>
          </div>
        </div>
      </div>
    `;
  },

  toggleSave(serviceId, event) {
    if (event) event.stopPropagation();
    let saved = JSON.parse(localStorage.getItem('fixit_saved') || '[]');
    const btn = event?.currentTarget;
    const icon = btn?.querySelector('i');
    if (saved.includes(serviceId)) {
      saved = saved.filter(id => id !== serviceId);
      if (btn) btn.classList.remove('saved');
      if (icon) {
        icon.className = 'fa-regular fa-heart';
        icon.style.color = '';
      }
    } else {
      saved.push(serviceId);
      if (btn) btn.classList.add('saved');
      if (icon) {
        icon.className = 'fa-solid fa-heart';
        icon.style.color = '#e11d48';
      }
    }
    localStorage.setItem('fixit_saved', JSON.stringify(saved));
  }
};

window.Components = Components;
