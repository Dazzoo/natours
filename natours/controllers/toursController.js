const fs = require('fs')
const Tour = require('../models/tourModel')
const { query } = require('express')
const APIFeatures = require('./../utility/apiFeatures')
const catchAsync = require('./../utility/catchAsync')
const AppError = require('../utility/appError')

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

module.exports.getBestFiveTours = catchAsync(async (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-price,rating'
    req.query.fields = 'name,price,rating'
    next()
})

module.exports.getTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .select()
        .pagination()

    let query = await features.query

    const tours = await query
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        body: {
            tours,
        },
    })
})

module.exports.getTourById = catchAsync(async (req, res, next) => {
    const id = req.params.id

    const tour = await Tour.findById(id)

    if (!tour) {
        return next(new AppError(`Tour with ID: ${id} is not found`), 404)
    }

    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        body: {
            tour,
        },
    })
})

module.exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body)
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        body: {
            newTour,
        },
    })
})

module.exports.editTourParamById = catchAsync(async (req, res, next) => {
    const id = req.params.id

    const tour = await Tour.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
        runValidators: true,
    })

    if (!tour) {
        return next(new AppError(`Tour with ID: ${id} is not found`), 404)
    }

    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        body: {
            tour,
        },
    })
})

module.exports.deleteTour = catchAsync(async (req, res, next) => {
    const id = req.params.id

    const tour = await Tour.findByIdAndDelete(id)

    if (!tour) {
        return next(new AppError(`Tour with ID: ${id} is not found`), 404)
    }

    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        body: {
            tour,
        },
    })
})

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
