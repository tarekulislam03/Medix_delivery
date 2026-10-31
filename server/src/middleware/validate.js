import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

/**
 * Middleware factory to validate req.body, req.query, or req.params against a Zod schema.
 */
export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const parsed = await schema.parseAsync(data);
      if (source === 'body') req.body = parsed;
      else if (source === 'query') req.query = parsed;
      else req.params = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        return sendError(res, 'VALIDATION_ERROR', 'Input validation failed', 422, issues);
      }
      return sendError(res, 'BAD_REQUEST', err.message, 400);
    }
  };
}
