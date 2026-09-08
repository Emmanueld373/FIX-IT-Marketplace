import { getClerkUser, clerkClient } from './auth.js';

/**
 * Checks if a user has admin access.
 * Mirrors the logic from lib/auth/admin.ts
 */
export async function checkAdminAccess(userId) {
  if (!userId) return { isAdmin: false, userId: null };

  try {
    // Fetch live user from Clerk
    let user = null;
    if (clerkClient) {
      try {
        user = await clerkClient.users.getUser(userId);
      } catch (e) {
        console.warn('[ADMIN_LIVE_USER_FETCH_FALLBACK]', e?.message);
      }
    }

    const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

    // 1. Check Clerk publicMetadata role
    if (user?.publicMetadata?.role === 'admin') {
      return { isAdmin: true, userId, email: userEmail };
    }

    // 2. Check ADMIN_EMAILS environment variable
    const adminEmailsConfig = process.env.ADMIN_EMAILS;
    if (adminEmailsConfig && userEmail) {
      const allowedAdminEmails = adminEmailsConfig
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

      if (allowedAdminEmails.includes(userEmail)) {
        return { isAdmin: true, userId, email: userEmail };
      }
    }

    // 3. Check ADMIN_USER_IDS
    const adminUserIds = (process.env.ADMIN_USER_IDS || '')
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);

    if (adminUserIds.includes(userId)) {
      return { isAdmin: true, userId, email: userEmail };
    }

    return { isAdmin: false, userId, email: userEmail };
  } catch (error) {
    console.error('[CHECK_ADMIN_ACCESS_ERROR]', error);
    return { isAdmin: false, userId: null };
  }
}

/**
 * Express middleware: requires admin access.
 */
export async function requireAdmin(req, res, next) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { isAdmin } = await checkAdminAccess(req.userId);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  req.isAdmin = true;
  next();
}
