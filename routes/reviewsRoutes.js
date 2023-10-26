const express = require('express')
const reviewsController = require('../controllers/reviewsController')
const authController = require('../controllers/authController')

const reviewRouter = express.Router({ mergeParams: true })

reviewRouter
    .route('/')
    .get(reviewsController.getReviews)
    .post(
        authController.protect,
        authController.PermitOnlyTo('user'),
        reviewsController.createReviewParams,
        reviewsController.createReview
    )

reviewRouter
    .route('/:id')
    .get(reviewsController.getReviewById)
    .patch(
        authController.PermitOnlyTo('admin', 'user'),
        authController.protect,
        reviewsController.editReviewParamById
    )
    .delete(
        authController.PermitOnlyTo('admin', 'user'),
        authController.protect,
        reviewsController.deleteReview
    )
module.exports = reviewRouter
