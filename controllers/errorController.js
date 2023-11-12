const AppError = require('../utility/appError')

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateErrorDB = (err) => {
    const message = `Duplicate field value: ${err.keyValue.name}. Please use another one!`
    return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
    const errorsList = Object.values(err.errors).map((el) => el.message)
    const message = `Validation error: ${errorsList.join('. ')}`
    return new AppError(message, 400)
}

const handleJWTTokenError = () => {
    return new AppError('Token error. Please log in again!', 401)
}

const handleJWTExpiredError = () => {
    return new AppError('Token expired. Please log in again!', 401)
}

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    } else {
        console.log('ERROR 💥', err)

        res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
        })
    }
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        isOperational: err.isOperational,
        error: err,
        stack: err.stack,
    })
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    console.log('API ERROR 💥')
    console.log(err)
    console.log('API ERROR 💥')
    if (process.env.NODE_ENVIRONMENT === 'development') {
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENVIRONMENT === 'production') {
        let error = { ...err }
        if (err.name === 'CastError') error = handleCastErrorDB(error)
        if (err.code === 11000) error = handleDuplicateErrorDB(error)
        if (err.name === 'ValidationError')
            error = handleValidationErrorDB(error)
        if (err.name === 'JsonWebTokenError') error = handleJWTTokenError()
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError()
        if (req.path === '/api/v1/users/login') return sendErrorDev(err, res)
        sendErrorProd(error, res)
    }
}
