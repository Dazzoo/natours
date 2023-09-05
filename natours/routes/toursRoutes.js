const express = require('express')
const toursController = require('../controllers/toursController')
const authController = require('../controllers/authController')
const reviewsRouter = require('./reviewsRoutes')

const tourRouter = express.Router()

// tourRouter.param('id', toursController.checkId)

tourRouter
    .route('/')
    .get(toursController.getTours)
    .post(
        authController.protect,
        authController.PermitOnlyTo('admin', 'lead-guide'),
        toursController.createTour
    )

tourRouter.route('/params/:slug').get(toursController.getTourBySlug)

tourRouter.use('/:tourId/reviews', reviewsRouter)

tourRouter.use(authController.protect)

tourRouter
    .route('/:id')
    .get(toursController.getTourById)
    .patch(
        authController.PermitOnlyTo('admin', 'lead-guide'),
        toursController.editTourParamById
    )
    .delete(
        authController.PermitOnlyTo('admin', 'lead-guide'),
        toursController.deleteTour
    )

tourRouter
    .route('/best-five-tours')
    .get(toursController.getBestFiveTours, toursController.getTours)

tourRouter.route('/report').get(toursController.getToursReport)

tourRouter.route('/monthly-plan/:year').get(toursController.getMonthlyReport)

tourRouter
    .route('/within/:distance/center/:lanlon/units/:units')
    .get(toursController.getToursWithinRadius)

tourRouter
    .route('/center/:lanlon/units/:units')
    .get(toursController.getToursNearSort)

module.exports = tourRouter
