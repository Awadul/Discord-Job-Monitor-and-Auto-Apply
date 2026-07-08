// centralized error handler for the backend

const errorhandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";
    res.status(err.statusCode).json({
        success: false,
        statusCode: err.statusCode,
        message: err.message,
        stack: err.stack
    });
}


export { errorhandler };