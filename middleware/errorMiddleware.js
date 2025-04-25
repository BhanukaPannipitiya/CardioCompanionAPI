// @desc    Handle 404 errors for routes that don't exist
// @access  Public
const notFound = (req, res, next) => {
    console.log('❌ Route not found:', req.originalUrl);
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// @desc    Handle all other errors
// @access  Public
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);
    
    // Sometimes the status code might be set in the response already
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        // Include error details if available
        ...(err.errors && { errors: err.errors }),
        ...(err.code && { code: err.code })
    });
};

module.exports = {
    notFound,
    errorHandler
}; 