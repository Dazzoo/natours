const express = require('express')
const reviewsController = require('../controllers/reviewsController')
const authController = require('../controllers/authController')

const reviewRouter = express.Router()

reviewRouter
    .route('/')
    .get(authController.protect, reviewsController.getReviews)
    .post(authController.protect, reviewsController.createReview)

module.exports = reviewRouter
