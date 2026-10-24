/**
 * Global Express error handling middleware.
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.status || (err.message?.includes('BOSON_API_KEY') ? 400 : 500);

  console.error(`[Cadence Server Error] ${req.method} ${req.url} (${statusCode}):`, err.message);

  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
      details: err.details || null
    }
  });
}
