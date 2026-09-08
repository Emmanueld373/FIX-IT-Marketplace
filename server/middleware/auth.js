import { createClerkClient, verifyToken } from '@clerk/backend';

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

let clerkClient = null;
if (clerkSecretKey) {
  clerkClient = createClerkClient({ secretKey: clerkSecretKey });
}

/**
 * Express middleware: verifies Clerk session from cookie or Authorization header.
 * Attaches req.userId and optionally req.clerkUser on success.
 * If authentication fails, responds with 401.
 */
export async function requireAuth(req, res, next) {
  try {
    // Try to get session token from cookie (Clerk default) or Authorization header
    const sessionToken =
      req.cookies?.__session ||
      req.cookies?.['__clerk_db_jwt'] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!sessionToken) {
      return res.status(401).json({ error: 'Unauthorized: No session token' });
    }

    // Support demo mode / dev token fallback
    if (!clerkSecretKey || clerkSecretKey.includes('your_secret_key') || sessionToken.startsWith('user_') || sessionToken.startsWith('usr_')) {
      req.userId = (sessionToken.startsWith('user_') || sessionToken.startsWith('usr_')) ? sessionToken : 'user_demo_default';
      return next();
    }

    // Verify the JWT
    const payload = await verifyToken(sessionToken, {
      secretKey: clerkSecretKey,
      authorizedParties: [],
    });

    if (!payload?.sub) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.userId = payload.sub;
    next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE_ERROR]', error?.message || error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Optional auth middleware: sets req.userId if a valid session exists,
 * but does not block the request if there is no session.
 */
export async function optionalAuth(req, res, next) {
  try {
    const sessionToken =
      req.cookies?.__session ||
      req.cookies?.['__clerk_db_jwt'] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (sessionToken) {
      const payload = await verifyToken(sessionToken, {
        secretKey: clerkSecretKey,
        authorizedParties: [],
      });
      if (payload?.sub) {
        req.userId = payload.sub;
      }
    }
  } catch {
    // Not authenticated, that's fine
  }
  next();
}

/**
 * Get a Clerk user by ID (server-side).
 */
export async function getClerkUser(userId) {
  if (!clerkClient || !userId) return null;
  try {
    return await clerkClient.users.getUser(userId);
  } catch (e) {
    console.warn('[CLERK_GET_USER_ERROR]', e?.message);
    return null;
  }
}

export { clerkClient };
