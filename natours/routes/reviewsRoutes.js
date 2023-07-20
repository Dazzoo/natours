const express = require('express')
const reviewsController = require('../controllers/reviewsController')
const authController = require('../controllers/authController')

const reviewRouter = express.Router({ mergeParams: true })

reviewRouter.use(authController.protect)

reviewRouter
    .route('/')
    .get(reviewsController.getReviews)
    .post(
        authController.PermitOnlyTo('user'),
        reviewsController.createReviewParams,
        reviewsController.createReview
    )

reviewRouter
    .route('/:id')
    .get(reviewsController.getReviewById)
    .patch(
        authController.PermitOnlyTo('admin', 'user'),
        reviewsController.editReviewParamById
    )
    .delete(
        authController.PermitOnlyTo('admin', 'user'),
        reviewsController.deleteReview
    )
module.exports = reviewRouter
