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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

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

    if (stats.length > 0) {
        await Tour.findOneAndUpdate(
            { _id: tourId },
            {
                ratingsQuantity: stats[0].ratingsQuantity,
                ratingsAverage: stats[0].ratingsAverage.toFixed(2),
            }
        )
    } else {
        await Tour.findOneAndUpdate(
            { _id: tourId },
            {
                ratingsQuantity: 0,
                ratingsAverage: 4.5,
            }
        )
    }
}

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//     this.r = await this.findOne()
//     console.log(this.r)
//     next()
// })

// save, findAndUpdate, findAndDelete

reviewSchema.post('save', function () {
    this.constructor.calculateReviewsAverage(this.tour)
    console.log('save')
})

reviewSchema.pre('findOneAndUpdate', function (next) {
    this.middlewareMethodName = 'findOneAndUpdate'
    next()
})

reviewSchema.pre('findOneAndDelete', async function (next) {
    this.doc = await this.model.findOne(this.getFilter())
    this.middlewareMethodName = 'findOneAndDelete'
    next()
})

reviewSchema.post('find', function (doc) {
    if (this.middlewareMethodName === 'findOneAndUpdate') {
        this.model.calculateReviewsAverage(doc.tour)
    } else if (this.middlewareMethodName === 'findOneAndDelete') {
        if (this.doc.tour) {
            this.model.calculateReviewsAverage(this.doc.tour)
        }
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
