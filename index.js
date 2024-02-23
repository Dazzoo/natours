const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const compression = require('compression')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const tourRouter = require('./routes/toursRoutes')
const usersRouter = require('./routes/usersRoutes')
const reviewsRouter = require('./routes/reviewsRoutes')
const bookingsRouter = require('./routes/bookingsRoutes')
const AppError = require('./utility/appError')
const globalErrorHandler = require('./controllers/errorController')
const next = require('next');

const app = express()

const frontend = next({ dev: !(process.env.NODE_ENVIRONMENT === 'production'), dir: '../natours-frontend' });
const handle = frontend.getRequestHandler();

frontend.prepare().then(() => {
    app.get('*', (req, res) => {   
         return handle(req, res);
    });

})

/// MIDDLEWARES

app.use(cookieParser())

/// 1) Set security HTTP headers -

app.use(helmet())

const corsOptions = {
    origin: process.env.FRONTEND_URL, // Replace with your frontend's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}

app.use(cors(corsOptions))

/// 2) DEV middlewares

if (process.env.NODE_ENVIRONMENT === 'development') {
    app.use(morgan('dev'))
}

/// 3) Limit api requests

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes
    max: 250, // Limit each IP to [count] requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use('/api', limiter)

// 4) Transform request ot js and limit size

app.use(express.json({ limit: '10kb' }))

// 5) Sanitize the request data to protect against malicious queries to the database.

app.use(mongoSanitize())

// 5) Sanitize the request data to protect against html

app.use(xss())

app.use(express.static(`${__dirname}/public`))

app.use(compression())

// 6) Testing middleware

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

/// ROUTES

app.use('/api/v1/tours', tourRouter)

app.use('/api/v1/users', usersRouter)

app.use('/api/v1/reviews', reviewsRouter)

app.use('/api/v1/bookings', bookingsRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server`, 404))
})

app.use(globalErrorHandler)

module.exports = app
