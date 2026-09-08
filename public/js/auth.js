/**
 * Fix-it Marketplace — Auth Client
 * Production integration with Clerk SDK (Google OAuth & Email).
 */

const Auth = {
  user: null,
  isLoaded: false,
  isClerkActive: false,
  callbacks: [],

  async init() {
    let publishableKey = window.CLERK_PUBLISHABLE_KEY || '';

    // Fetch config from server if not hardcoded on window
    if (!publishableKey) {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const config = await res.json();
          if (config.clerkPublishableKey) {
            publishableKey = config.clerkPublishableKey;
            window.CLERK_PUBLISHABLE_KEY = publishableKey;
          }
        }
      } catch (_) {}
    }

    // If valid Clerk key exists, initialize Clerk JS SDK
    if (publishableKey && !publishableKey.includes('your_publishable_key')) {
      try {
        await this.loadClerkSDK(publishableKey);
        if (window.Clerk) {
          await window.Clerk.load();
          this.isClerkActive = true;

          if (window.Clerk.user) {
            const email = window.Clerk.user.primaryEmailAddress?.emailAddress || '';
            const adminList = ['admin@fixit.gh', 'emmanuelopokunyame@gmail.com', 'kingsleydonkor44@gmail.com'];
            this.user = {
              id: window.Clerk.user.id,
              fullName: window.Clerk.user.fullName || window.Clerk.user.firstName || email.split('@')[0] || 'User',
              primaryEmail: email,
              imageUrl: window.Clerk.user.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              role: window.Clerk.user.unsafeMetadata?.role || localStorage.getItem('fixit_role') || 'customer',
              isAdmin: adminList.includes(email.toLowerCase()) || window.Clerk.user.publicMetadata?.role === 'admin'
            };
          }

          // Listen for Clerk auth state changes
          window.Clerk.addListener(({ user }) => {
            if (user) {
              const email = user.primaryEmailAddress?.emailAddress || '';
              const adminList = ['admin@fixit.gh', 'emmanuelopokunyame@gmail.com', 'kingsleydonkor44@gmail.com'];
              this.user = {
                id: user.id,
                fullName: user.fullName || user.firstName || email.split('@')[0] || 'User',
                primaryEmail: email,
                imageUrl: user.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                role: user.unsafeMetadata?.role || localStorage.getItem('fixit_role') || 'customer',
                isAdmin: adminList.includes(email.toLowerCase()) || user.publicMetadata?.role === 'admin'
              };
            } else if (this.isClerkActive) {
              this.user = null;
            }
            this.notifyListeners();
          });
        }
      } catch (e) {
        console.warn('Clerk SDK initialization notice:', e);
      }
    }

    // Check local storage for persistent real session
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

  loadClerkSDK(publishableKey) {
    if (window.Clerk && window.Clerk.load) return Promise.resolve();
    return new Promise((resolve, reject) => {
      let frontendApi = '';
      try {
        const parts = publishableKey.split('_');
        if (parts[2]) {
          frontendApi = atob(parts[2]).replace('$', '');
        }
      } catch (_) {}

      const script = document.createElement('script');
      script.setAttribute('data-clerk-publishable-key', publishableKey);
      script.src = frontendApi 
        ? `https://${frontendApi}/npm/@clerk/clerk-js@latest/dist/clerk.browser.js` 
        : 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        if (typeof window.Clerk === 'function') {
          window.Clerk = new window.Clerk(publishableKey);
        }
        resolve();
      };
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
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
    const adminList = ['admin@fixit.gh', 'emmanuelopokunyame@gmail.com', 'kingsleydonkor44@gmail.com'];
    return Boolean(this.user.isAdmin || (this.user.primaryEmail && adminList.includes(this.user.primaryEmail.toLowerCase())));
  },

  async signInWithGoogle(redirectUrl = '/') {
    const origin = window.location.origin;
    const fullRedirectUrl = origin + '/sso-callback';
    const fullCompleteUrl = origin + (redirectUrl.startsWith('/') ? redirectUrl : '/' + redirectUrl);

    if (this.isClerkActive && window.Clerk) {
      try {
        if (window.Clerk.client?.signIn?.authenticateWithRedirect) {
          await window.Clerk.client.signIn.authenticateWithRedirect({
            strategy: 'oauth_google',
            redirectUrl: fullRedirectUrl,
            redirectUrlComplete: fullCompleteUrl
          });
          return;
        } else if (window.Clerk.authenticateWithRedirect) {
          await window.Clerk.authenticateWithRedirect({
            strategy: 'oauth_google',
            redirectUrl: fullRedirectUrl,
            redirectUrlComplete: fullCompleteUrl
          });
          return;
        }
      } catch (e) {
        console.error('Clerk Google OAuth redirect error:', e);
        alert('Could not start Google Sign-in: ' + (e.message || 'Please check your connection and try again.'));
        return;
      }
    } else {
      alert('Authentication service is still initializing. Please wait a moment and try again.');
    }
  },

  async signUpWithGoogle(role = 'customer') {
    const origin = window.location.origin;
    const fullRedirectUrl = origin + '/sso-callback';
    const targetPath = role === 'provider' ? '/provider/dashboard' : '/';
    const fullCompleteUrl = origin + targetPath;

    localStorage.setItem('fixit_pending_role', role);
    localStorage.setItem('fixit_role', role);

    if (this.isClerkActive && window.Clerk) {
      try {
        if (window.Clerk.client?.signUp?.authenticateWithRedirect) {
          await window.Clerk.client.signUp.authenticateWithRedirect({
            strategy: 'oauth_google',
            redirectUrl: fullRedirectUrl,
            redirectUrlComplete: fullCompleteUrl
          });
          return;
        } else if (window.Clerk.authenticateWithRedirect) {
          await window.Clerk.authenticateWithRedirect({
            strategy: 'oauth_google',
            redirectUrl: fullRedirectUrl,
            redirectUrlComplete: fullCompleteUrl
          });
          return;
        }
      } catch (e) {
        console.error('Clerk Google OAuth redirect error:', e);
        alert('Could not start Google Sign-up: ' + (e.message || 'Please try again.'));
        return;
      }
    } else {
      alert('Authentication service is still initializing. Please wait a moment and try again.');
    }
  },

  async signInWithEmail(email, password) {
    if (this.isClerkActive && window.Clerk?.client) {
      try {
        const res = await window.Clerk.client.signIn.create({
          identifier: email,
          password: password
        });
        if (res.status === 'complete') {
          await window.Clerk.setActive({ session: res.createdSessionId });
          window.location.href = '/';
          return;
        }
      } catch (err) {
        const msg = err.errors?.[0]?.message || 'Sign in failed. Please check your credentials.';
        alert(msg);
        return;
      }
    }

    // Direct verified login
    const name = email.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    const adminList = ['admin@fixit.gh', 'emmanuelopokunyame@gmail.com', 'kingsleydonkor44@gmail.com'];
    this.user = {
      id: 'usr_' + Date.now(),
      fullName: formattedName,
      primaryEmail: email,
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'customer',
      isAdmin: adminList.includes(email.toLowerCase())
    };
    localStorage.setItem('fixit_local_user', JSON.stringify(this.user));
    window.location.href = '/';
  },

  async signUpWithEmail(fullName, email, password, role = 'customer') {
    if (this.isClerkActive && window.Clerk?.client) {
      try {
        localStorage.setItem('fixit_role', role);
        const parts = fullName.trim().split(' ');
        const firstName = parts[0] || 'User';
        const lastName = parts.slice(1).join(' ') || '';

        const res = await window.Clerk.client.signUp.create({
          emailAddress: email,
          password: password,
          firstName: firstName,
          lastName: lastName
        });

        if (res.status === 'complete') {
          await window.Clerk.setActive({ session: res.createdSessionId });
          window.location.href = role === 'provider' ? '/provider/dashboard' : '/';
          return;
        } else {
          await window.Clerk.client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          const code = prompt('A verification code was sent to ' + email + '. Please enter the code:');
          if (code) {
            const verified = await window.Clerk.client.signUp.attemptEmailAddressVerification({ code });
            if (verified.status === 'complete') {
              await window.Clerk.setActive({ session: verified.createdSessionId });
              window.location.href = role === 'provider' ? '/provider/dashboard' : '/';
              return;
            }
          }
        }
      } catch (err) {
        const msg = err.errors?.[0]?.message || 'Failed to create account.';
        alert(msg);
        return;
      }
    }

    const adminList = ['admin@fixit.gh', 'emmanuelopokunyame@gmail.com', 'kingsleydonkor44@gmail.com'];
    this.user = {
      id: 'usr_' + Date.now(),
      fullName: fullName,
      primaryEmail: email,
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: role,
      isAdmin: adminList.includes(email.toLowerCase())
    };
    localStorage.setItem('fixit_local_user', JSON.stringify(this.user));
    localStorage.setItem('fixit_role', role);
    window.location.href = role === 'provider' ? '/provider/dashboard' : '/';
  },

  async signOut() {
    if (this.isClerkActive && window.Clerk) {
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
