/**
 * Fix-it Marketplace — API Client
 */
const API = {
  baseUrl: '/api',

  /**
   * Helper to make HTTP requests with automatic JSON parsing and token injection.
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Attach Clerk token or local auth token
    if (window.Clerk && window.Clerk.session) {
      try {
        const token = await window.Clerk.session.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('Could not get Clerk session token:', err);
      }
    } else if (window.Auth && window.Auth.getUser()) {
      headers['Authorization'] = `Bearer ${window.Auth.getUser().id}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.error || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  },

  // Categories
  async getCategories() {
    return this.request('/categories');
  },

  async getCategoryDetail(slug) {
    return this.request(`/categories/${slug}`);
  },

  // Search & Services
  async searchServices(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return this.request(`/search?${query.toString()}`);
  },

  async getServiceDetail(slug) {
    return this.request(`/services/${slug}`);
  },

  // Bookings
  async getBookings() {
    return this.request('/bookings');
  },

  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  async updateBookingStatus(id, status) {
    return this.request('/bookings', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });
  },

  // Provider
  async getProviderProfile() {
    return this.request('/provider/profile');
  },

  async saveProviderProfile(profileData) {
    return this.request('/provider/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  async getProviderDashboardData() {
    return this.request('/provider/dashboard-data');
  },

  async createProviderService(serviceData) {
    return this.request('/provider/service', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  },

  // Admin
  async checkAdmin() {
    return this.request('/admin/check');
  },

  async getAdminStats() {
    return this.request('/admin/stats');
  },

  async getAdminProviders() {
    return this.request('/admin/providers');
  },

  async updateProviderStatus(providerId, status) {
    return this.request('/admin/provider-status', {
      method: 'POST',
      body: JSON.stringify({ providerId, status }),
    });
  },

  // Upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    if (window.Clerk && window.Clerk.session) {
      try {
        const token = await window.Clerk.session.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.warn(err);
      }
    } else if (window.Auth && window.Auth.getUser()) {
      headers['Authorization'] = `Bearer ${window.Auth.getUser().id}`;
    }

    const res = await fetch(`${this.baseUrl}/upload/image`, {
      method: 'POST',
      body: formData,
      headers,
    });
    return res.json();
  }
};

window.API = API;
