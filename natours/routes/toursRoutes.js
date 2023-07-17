const express = require('express')
const toursController = require('../controllers/toursController')
const authController = require('../controllers/authController')
const reviewsController = require('../controllers/reviewsController')

const tourRouter = express.Router()

// tourRouter.param('id', toursController.checkId)

tourRouter
    .route('/best-five-tours')
    .get(toursController.getBestFiveTours, toursController.getTours)

tourRouter.route('/report').get(toursController.getToursReport)

tourRouter.route('/monthly-plan/:year').get(toursController.getMonthlyReport)

tourRouter
    .route('/')
    .get(authController.protect, toursController.getTours)
    .post(authController.protect, toursController.createTour)

tourRouter
    .route('/:id')
    .get(authController.protect, toursController.getTourById)
    .patch(authController.protect, toursController.editTourParamById)
    .delete(
        authController.protect,
        authController.PermitOnlyTo('admin', 'lead-guide'),
        toursController.deleteTour
    )

tourRouter
    .route('/:tourId/review')
    .post(authController.protect, reviewsController.createReview)

module.exports = tourRouter
