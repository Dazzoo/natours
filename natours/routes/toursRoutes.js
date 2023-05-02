const express = require('express')
const toursController = require('../controllers/toursController')

const tourRouter = express.Router()

// tourRouter.param('id', toursController.checkId)

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
