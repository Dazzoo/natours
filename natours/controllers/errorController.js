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
        error: err,
        stack: err.stack,
    })
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENVIROMENT === 'development') {
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENVIROMENT === 'production') {
        sendErrorProd(err, res)
    }
}
