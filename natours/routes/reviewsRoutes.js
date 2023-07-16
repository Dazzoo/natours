const express = require('express')
const reviewController = require('../controllers/reviewsController')
const authController = require('../controllers/authController')

const reviewRouter = express.Router()

reviewRouter
    .route('/')
    .get(authController.protect, reviewController.getReviews)
    .post(authController.protect, reviewController.createReview)

module.exports = reviewRouter
