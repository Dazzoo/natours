const fs = require('fs')
const Tour = require('../models/tourModel')
const { query } = require('express')
const APIFeatures = require('./../utility/apiFeatures')

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

module.exports.getBestFiveTours = async (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-price,rating'
    req.query.fields = 'name,price,rating'
    next()
}

module.exports.getTours = async (req, res) => {
    try {
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
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status: 'fail',
            message: err,
        })
    }
}

module.exports.getTourById = async (req, res) => {
    try {
        const id = req.params.id

        const tour = await Tour.findById(id)

        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            body: {
                tour,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        })
    }
}

module.exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body)
        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            body: {
                newTour,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        })
    }
}

module.exports.editTourParamById = async (req, res) => {
    try {
        const id = req.params.id

        const tour = await Tour.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        })
        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            body: {
                tour,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        })
    }
}

module.exports.deleteTour = async (req, res) => {
    try {
        const id = req.params.id

        const tour = await Tour.findByIdAndDelete(id)
        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            body: {
                tour,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        })
    }
}

module.exports.getToursReport = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        })
    }
}

module.exports.getMonthlyReport = async (req, res) => {
    try {
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
    } catch (err) {
        console.log(err)
        res.status(400).json({
            status: 'fail',
            message: err,
        })
    }
}
