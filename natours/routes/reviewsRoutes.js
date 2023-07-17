const express = require('express')
const reviewsController = require('../controllers/reviewsController')
const authController = require('../controllers/authController')

const reviewRouter = express.Router({ mergeParams: true })

reviewRouter
    .route('/')
    .get(authController.protect, reviewsController.getReviews)
    .post(authController.protect, reviewsController.createReview)

reviewRouter.route('/:id').delete(reviewsController.deleteReview)

module.exports = reviewRouter
