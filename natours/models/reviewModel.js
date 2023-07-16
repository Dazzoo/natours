const mongoose = require('mongoose')

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
