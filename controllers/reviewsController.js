const Review = require('../models/reviewModel')
const ApiFeatures = require('../utility/apiFeatures')
const catchAsync = require('../utility/catchAsync')
const factory = require('./handlerFactory')

module.exports.getReviews = factory.getAll(Review)

module.exports.getReviewById = factory.getOne(Review)

module.exports.createReview = factory.createOne(Review)

module.exports.editReviewParamById = factory.updateOne(Review)

module.exports.deleteReview = factory.deleteOne(Review)

module.exports.createReviewParams = catchAsync(async (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.user._id
    next()
})
