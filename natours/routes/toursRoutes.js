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

tourRouter.use('/:tourId/reviews', reviewsRouter)

tourRouter
    .route('/best-five-tours')
    .get(toursController.getBestFiveTours, toursController.getTours)

tourRouter.route('/report').get(toursController.getToursReport)

tourRouter.route('/monthly-plan/:year').get(toursController.getMonthlyReport)

module.exports = tourRouter
