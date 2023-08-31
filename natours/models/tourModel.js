const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const User = require('./userModel')

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
            set: (val) => parseFloat(val.toFixed(2)),
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
        startLocation: {
            // Geo JSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
})

/// SAVE MIDDLEWARE
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

// // EMBED TOUR GUIDES BY ID
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(
//         async (id) => await User.findById(id)
//     )
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })

// tourSchema.pre(/find|Update/gi, async function (next) {
//     const guidesPromises = this._update.guides.map(
//         async (id) => await User.findById(id)
//     )
//     this._update.guides = await Promise.all(guidesPromises)
//     next()
// })

/// INDEX

tourSchema.index({ price: 1, ratingAverage: -1 })

tourSchema.index({ slug: 1 })

tourSchema.index({ startLocation: '2dsphere' })

/// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } }).select('-__v')
    this.start = Date.now()
    next()
})

tourSchema.post(/^find/, function (doc, next) {
    console.log(`Query took ${Date.now() - this.start} ms`)
    next()
})

tourSchema.pre(/^find/, function (next) {
    this.populate({ path: 'guides' })
    next()
})

/// AGGREGATE MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
    // this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    next()
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
