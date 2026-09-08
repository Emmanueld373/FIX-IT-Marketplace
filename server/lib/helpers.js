/**
 * Utility helper functions shared across routes.
 */

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Send a JSON error response.
 */
export function errorResponse(res, message, status = 500) {
  return res.status(status).json({ error: message });
}

/**
 * Send a JSON success response.
 */
export function successResponse(res, data) {
  return res.json({ success: true, ...data });
}
