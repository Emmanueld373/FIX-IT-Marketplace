/**
 * Fix-it Marketplace — Auth Client
 * Seamlessly integrates Clerk SDK and provides offline/demo user mode fallback.
 */

const Auth = {
  user: null,
  isLoaded: false,
  callbacks: [],

  async init() {
    // Check if Clerk publishable key is available
    const publishableKey = window.CLERK_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here';

    if (window.Clerk && publishableKey && !publishableKey.includes('your_publishable_key')) {
      try {
        await window.Clerk.load();
        if (window.Clerk.user) {
          this.user = {
            id: window.Clerk.user.id,
            fullName: window.Clerk.user.fullName || window.Clerk.user.firstName || 'User',
            primaryEmail: window.Clerk.user.primaryEmailAddress?.emailAddress || '',
            imageUrl: window.Clerk.user.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: window.Clerk.user.unsafeMetadata?.role || localStorage.getItem('fixit_role') || 'customer',
            isAdmin: window.Clerk.user.publicMetadata?.role === 'admin',
          };
        }
      } catch (e) {
        console.warn('Clerk initialization notice:', e);
      }
    }

    // Fallback: Check local storage for session state
    if (!this.user) {
      const savedUser = localStorage.getItem('fixit_local_user');
      if (savedUser) {
        try {
          this.user = JSON.parse(savedUser);
        } catch (_) {}
      }
    }

    this.isLoaded = true;
    this.notifyListeners();
  },

  onStateChange(cb) {
    this.callbacks.push(cb);
    if (this.isLoaded) cb(this.user);
  },

  notifyListeners() {
    this.callbacks.forEach(cb => {
      try { cb(this.user); } catch (e) { console.error(e); }
    });
  },

  isSignedIn() {
    return Boolean(this.user);
  },

  getUser() {
    return this.user;
  },

  isProvider() {
    if (!this.user) return false;
    return this.user.role === 'provider' || localStorage.getItem('fixit_role') === 'provider' || this.isAdmin();
  },

  isAdmin() {
    if (!this.user) return false;
    return Boolean(this.user.isAdmin || localStorage.getItem('fixit_role') === 'admin');
  },

  async becomeProvider(name) {
    if (!this.user) {
      this.user = {
        id: 'user_prov_' + Date.now(),
        fullName: name || 'Artisan Provider',
        primaryEmail: 'provider@fixit.gh',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'provider',
        isAdmin: false
      };
    } else {
      this.user.role = 'provider';
      if (name) this.user.fullName = name;
    }
    localStorage.setItem('fixit_role', 'provider');
    localStorage.setItem('fixit_local_user', JSON.stringify(this.user));
    this.notifyListeners();
    return this.user;
  },

  async loginDemo(role = 'customer') {
    const demoUsers = {
      customer: {
        id: 'user_cust_demo123',
        fullName: 'Ama Mensah',
        primaryEmail: 'ama.mensah@example.com',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'customer',
        isAdmin: false
      },
      provider: {
        id: 'user_prov_demo456',
        fullName: 'Kofi Owusu',
        primaryEmail: 'kofi.owusu@example.com',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'provider',
        isAdmin: false
      },
      admin: {
        id: 'user_admin_demo789',
        fullName: 'Admin Kwame',
        primaryEmail: 'admin@fixit.gh',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        role: 'admin',
        isAdmin: true
      }
    };

    this.user = demoUsers[role] || demoUsers.customer;
    localStorage.setItem('fixit_local_user', JSON.stringify(this.user));
    localStorage.setItem('fixit_role', this.user.role);
    this.notifyListeners();
    return this.user;
  },

  async signOut() {
    if (window.Clerk) {
      try {
        await window.Clerk.signOut();
      } catch (_) {}
    }
    this.user = null;
    localStorage.removeItem('fixit_local_user');
    localStorage.removeItem('fixit_role');
    this.notifyListeners();
    window.location.href = '/';
  }
};

window.Auth = Auth;
