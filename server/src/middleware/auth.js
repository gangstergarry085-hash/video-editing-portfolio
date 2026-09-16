import { createError } from './errorHandler.js';

/**
 * Middleware: require an authenticated session.
 * Attach to any route that should only be accessible to logged-in admins.
 */
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return next(createError(401, 'Authentication required'));
  }
  next();
}
