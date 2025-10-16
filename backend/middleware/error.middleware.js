// middleware/error.middleware.js
// Global error handling middleware

// ==================== NOT FOUND HANDLER ====================
// Catches requests to non-existent routes
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// ==================== GLOBAL ERROR HANDLER ====================
// Catches all errors from anywhere in the app
const errorHandler = (err, req, res, next) => {
  // Determine status code
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error details (for debugging)
  console.error('🔴 ERROR:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  // ==================== MONGOOSE ERRORS ====================
  
  // Validation Error (e.g., required field missing)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(e => e.message);
    
    return res.status(statusCode).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }
  
  // Cast Error (e.g., invalid MongoDB ID)
  if (err.name === 'CastError') {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: 'Invalid ID format',
      error: err.message
    });
  }
  
  // Duplicate Key Error (e.g., trying to create duplicate)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    return res.status(statusCode).json({
      success: false,
      message: `Duplicate value for ${field}`,
      error: err.message
    });
  }
  
  // ==================== JWT ERRORS (if you add authentication later) ====================
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    return res.status(statusCode).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    return res.status(statusCode).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // ==================== DEFAULT ERROR RESPONSE ====================
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only show stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// ==================== ASYNC ERROR WRAPPER ====================
// Wraps async functions to catch errors automatically
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==================== EXPORT ====================
module.exports = {
  notFound,
  errorHandler,
  asyncHandler
};

// HOW TO USE IN server.js:
// const { notFound, errorHandler } = require('./middleware/error.middleware');
// 
// app.use(notFound); // Place AFTER all routes
// app.use(errorHandler); // Place LAST

// HOW TO USE asyncHandler in controllers:
// exports.createDoll = asyncHandler(async (req, res) => {
//   // Your code - errors are caught automatically!
// });