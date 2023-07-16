const Review = require('../models/reviewModel')
const ApiFeatures = require('../utility/apiFeatures')
const catchAsync = require('../utility/catchAsync')

module.exports.getReviews = catchAsync(async (req, res, next) => {
    const features = new ApiFeatures(Review.find(), req.body)
        .filter()
        .sort()
        .select()
        .pagination()

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
