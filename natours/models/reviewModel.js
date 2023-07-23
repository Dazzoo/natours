const mongoose = require('mongoose')
const Tour = require('../models/tourModel')

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: true,
            maxlength: [
                2000,
                'A review must have less or equal than 2000 characters',
            ],
            minLength: [
                10,
                'A tour name must have more or equal than 10 characters',
            ],
        },
        rating: {
            type: Number,
            required: true,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            enum: [Date.now()],
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: true,
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// STATIC

reviewSchema.statics.calculateReviewsAverage = async function (tourId) {
    console.log(tourId)
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: tourId,
                ratingsQuantity: { $sum: 1 },
                ratingsAverage: { $avg: '$rating' },
            },
        },
    ])

    await Tour.findOneAndUpdate(
        { _id: tourId },
        {
            ratingsQuantity: stats[0].ratingsQuantity,
            ratingsAverage: stats[0].ratingsAverage,
        }
    )
}

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//     this.r = await this.findOne()
//     console.log(this.r)
//     next()
// })

// calculateReviewsAverage

reviewSchema.post('save', function () {
    this.constructor.calculateReviewsAverage(this.tour)
    console.log('save')
})

reviewSchema.pre('findOneAndUpdate', function (next) {
    console.log('findOneAndUpdate')
    this.isFindOneAndUpdate = true
    next()
})

reviewSchema.post('find', function (doc) {
    if (this.isFindOneAndUpdate) {
        this.model.calculateReviewsAverage(doc.tour)
    }
})

//________________________

reviewSchema.pre(/^find/, function (next) {
    this.find().select('-__v')
    next()
})

reviewSchema.pre(/^find/, function (next) {
    this.populate([
        {
            path: 'user',
            select: 'name photo',
        },
    ])
    next()
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
