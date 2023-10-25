const express = require('express')
const bookingsController = require('../controllers/bookingsController')
const authController = require('../controllers/authController')

const bookingRouter = express.Router()

bookingRouter
    .route('/checkout-session/:tourId')
    .get(authController.protect, bookingsController.createCheckoutSession)

bookingRouter
    .route('/')
    .post(authController.protect, bookingsController.createBooking)

bookingRouter
    .route('/:id')
    .get(authController.protect, bookingsController.getBookingsByUserId)

module.exports = bookingRouter
