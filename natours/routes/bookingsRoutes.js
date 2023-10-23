const express = require('express')
const bookingsController = require('../controllers/bookingsController')
const authController = require('../controllers/authController')

const bookingRouter = express.Router()

bookingRouter
    .route('/checkout-session/:tourId')
    .get(authController.protect, bookingsController.createCheckoutSession)

module.exports = bookingRouter
