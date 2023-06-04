const mongoose = require('mongoose')
const slugify = require('slugify')

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
        },
        slug: {
            type: String,
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
        secretTour: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

tourSchema.pre('save', function (next) {
    console.log('PRE SAVE HOOK')
    this.slug = slugify(this.name, { lower: true })
    next()
})

tourSchema.post('save', function (doc, next) {
    console.log('POST SAVE HOOK')
    console.log(doc)
    next()
})

tourSchema.pre(/^find/, function (next) {
    console.log('PRE FIND HOOK')
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now()
    next()
})

tourSchema.post(/^find/, function (doc, next) {
    console.log('POST FIND HOOK')
    console.log(`Query took ${Date.now() - this.start} ms`)
    next()
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
