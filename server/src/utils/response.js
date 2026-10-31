/**
 * Standardized API Response Helper
 * Format: { success: boolean, data?: any, message?: string, error?: { code: string, message: string } }
 */

export function sendSuccess(res, data = null, message = null, statusCode = 200, meta = null) {
  const response = {
    success: true,
  };

  if (message) response.message = message;
  if (data !== null) response.data = data;
  if (meta) response.meta = meta;

  return res.status(statusCode).json(response);
}

export function sendError(res, code = 'BAD_REQUEST', message = 'An error occurred', statusCode = 400, details = null) {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) response.error.details = details;

  return res.status(statusCode).json(response);
}
