const express = require('express')
const toursController = require('../controllers/toursController')

const tourRouter = express.Router()

// tourRouter.param('id', toursController.checkId)

tourRouter
    .route('/best-five-tours')
    .get(toursController.getBestFiveTours, toursController.getTours)

tourRouter.route('/report').get(toursController.getToursReport)

tourRouter.route('/monthly-plan/:year').get(toursController.getMonthlyReport)

tourRouter
    .route('/')
    .get(toursController.getTours)
    .post(toursController.createTour)

tourRouter
    .route('/:id')
    .get(toursController.getTourById)
    .patch(toursController.editTourParamById)
    .delete(toursController.deleteTour)

module.exports = tourRouter
