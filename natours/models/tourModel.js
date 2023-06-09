const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            maxlength: [
                40,
                'A tour name must have less or equal than 40 characters',
            ],
            minlength: [
                3,
                'A tour name must have more or equal than 3 characters',
            ],
        },
        slug: {
            type: String,
        },
        ratingsAverage: {
            type: Number,
            required: false,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
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
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    return val < this.price
                },
                message: 'Discount price should be below regular price',
            },
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
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
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
/// SAVE MIDDLEWARE
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
/// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now()
    next()
})

tourSchema.post(/^find/, function (doc, next) {
    console.log(`Query took ${Date.now() - this.start} ms`)
    next()
})
/// AGGREGATE MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    next()
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
