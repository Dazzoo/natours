const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
    },
    ratingsAverage: {
        type: Number,
        required: false,
        default: 4.5,
    },
    ratingsQuantity: {
        type: Number,
        required: false,
        default: 0,
    },
    images: {
        type: [String],
        required: false,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have an cover image'],
        default: `${__dirname}/dev-data/img/new-tour-1.jpg`,
    },
    price: {
        type: Number,
        required: false,
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
        default: 7,
    },
    maxGroupSize: {
        type: Number,
        required: false,
    },
    difficulty: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    summary: {
        type: String,
        required: false,
    },
    startDates: {
        type: [Date],
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
