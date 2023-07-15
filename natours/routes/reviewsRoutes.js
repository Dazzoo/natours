const express = require('express')
const reviewController = require('../controllers/reviewsController')

const reviewRouter = express.Router()

reviewRouter
    .route('/')
    .get(reviewController.getReviews)
    .post(reviewController.createReview)

module.exports = reviewRouter
