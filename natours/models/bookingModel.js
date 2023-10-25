const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
    {
        price: {
            type: Number,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        paid: {
            type: Boolean,
            default: true,
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

bookingSchema.pre(/^find/, function (next) {
    this.populate([
        {
            path: 'tour',
        },
    ]).populate('user')
    next()
})

const Booking = mongoose.model('Booking', bookingSchema)

module.exports = Booking
