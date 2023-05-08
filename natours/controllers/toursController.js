const fs = require('fs')
const Tour = require('../models/tourModel')

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

module.exports.getTours = async (req, res) => {
    try {
        const tours = await Tour.find()
        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            body: {
                tours,
            },
        })
    } catch (err) {
        res.status(400).json({
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
