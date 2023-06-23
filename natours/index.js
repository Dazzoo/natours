const express = require('express')
const morgan = require('morgan')
const tourRouter = require('./routes/toursRoutes')
const usersRouter = require('./routes/usersRoutes')
const AppError = require('./utility/appError')
const globalErrorHandler = require('./controllers/errorController')

const app = express()

/// MIDDLEWARE

app.use(express.json())

app.use(express.static(`${__dirname}/public`))

if (process.env.NODE_ENVIROMENT === 'development') {
    app.use(morgan('dev'))
}

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

/// ROUTES

app.use('/api/v1/tours', tourRouter)

app.use('/api/v1/users', usersRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server`, 404))
})

app.use(globalErrorHandler)

module.exports = app
