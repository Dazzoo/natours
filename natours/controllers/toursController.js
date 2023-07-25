const fs = require('fs')
const Tour = require('../models/tourModel')
const { query } = require('express')
const APIFeatures = require('./../utility/apiFeatures')
const catchAsync = require('./../utility/catchAsync')
const AppError = require('../utility/appError')
const factory = require('./handlerFactory')

// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// )

/// VALIDATORS

// module.exports.checkId = (req, res, next, value) => {
//     let id = Number(value)

//     let tour = tours.find((t) => t.id === id)

//     if (!tour) {
//         if (id > tours.length) {
//             return res.status(404).json({
//                 status: 'fail',
//                 message: 'Invalid tour ID',
//             })
//         } else {
//             return res.status(404).json({
//                 status: 'fail',
//                 message: 'Something went wrong',
//             })
//         }
//     }
//     next()
// }

// module.exports.requiredParams = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: 'Required params: name, price',
//         })
//     }
//     console.log(!req.body.price)
//     next()
// }

///

module.exports.getTours = factory.getAll(Tour)

module.exports.getTourById = factory.getOne(Tour, { path: 'reviews' })

module.exports.createTour = factory.createOne(Tour)

module.exports.editTourParamById = factory.updateOne(Tour)

module.exports.deleteTour = factory.deleteOne(Tour)

module.exports.getToursReport = catchAsync(async (req, res, next) => {
    const report = await Tour.aggregate([
        {
            $match: {
                ratingsAverage: { $gte: 3.0 },
            },
        },
        {
            $group: {
                _id: null,
                totalCount: { $sum: 1 },
                ratingsQuantity: { $sum: '$ratingsQuantity' },
                averageRating: { $avg: '$ratingsAverage' },
                averagePrice: { $avg: '$price' },
                lowestPrice: { $min: '$price' },
                highestPrice: { $max: '$price' },
            },
        },
    ])

    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        body: {
            report,
        },
    })
})

module.exports.getMonthlyReport = catchAsync(async (req, res) => {
    const year = req.params.year * 1
    console.log(new Date(`${year}-01-01`))
    const MonthlyReport = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: {
                    $month: '$startDates',
                },
                totalTours: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $project: {
                month: '$_id',
                totalTours: '$totalTours',
                tours: '$tours',
            },
        },
        {
            $sort: {
                totalTours: -1,
            },
        },
    ])

    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        body: {
            MonthlyReport,
        },
    })
})

module.exports.getBestFiveTours = catchAsync(async (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-price,rating'
    req.query.fields = 'name,price,rating'
    next()
})

module.exports.getToursWithinRadius = catchAsync(async (req, res, next) => {
    const { lanlon, distance, units } = req.params
    const supportedUnits = ['km', 'mi']

    const lan = lanlon.split(',')[0]
    const lon = lanlon.split(',')[1]
    console.log(units)

    if (!lan || !lon) {
        return next(
            new AppError(
                'Please provide the correct Latitude and Longitude',
                400
            )
        )
    }
    if (!distance) {
        return next(new AppError('Please provide the correct Radius', 400))
    }
    if (!supportedUnits.includes(units)) {
        return next(new AppError('Units should be either km or mi', 400))
    }

    let radius

    if (units === 'km') {
        const radiusOfEarthKm = 6371
        radius = distance / radiusOfEarthKm
    } else {
        const radiusOfEarthMiles = 3959
        radius = distance / radiusOfEarthMiles
    }

    const doc = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lon, lan], radius],
            },
        },
    })

    res.status(200).json({
        success: 'success',
        data: {
            data: doc,
        },
    })
})
