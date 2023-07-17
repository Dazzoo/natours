const Review = require('../models/reviewModel')
const ApiFeatures = require('../utility/apiFeatures')
const catchAsync = require('../utility/catchAsync')
const factory = require('./handlerFactory')

module.exports.getReviews = catchAsync(async (req, res, next) => {
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }
    const features = new ApiFeatures(Review.find(filter), req.body)

    const reviews = await features.query

    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        body: {
            reviews,
        },
    })
    next()
})

module.exports.createReview = catchAsync(async (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.user._id
    const review = await Review.create(req.body)
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        body: {
            review,
        },
    })
    next()
})

module.exports.deleteReview = factory.deleteOne(Review)
