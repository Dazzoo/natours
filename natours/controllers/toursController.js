const fs = require('fs')
const Tour = require('../models/tourModel')

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
)

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

module.exports.getTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length - 1,
        requestTime: req.requestTime,
        data: {
            tours,
        },
    })
}

module.exports.getTourById = (req, res) => {
    const id = Number(req.params.id)

    const tour = tours.find((t) => t.id === id)

    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        body: {
            tour,
        },
    })
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

module.exports.editTourParamById = (req, res) => {
    const id = Number(req.params.id)

    const tour = tours.find((t) => t.id === id)

    const newTours = [...tours]

    const index = newTours.findIndex((t) => t.id === id)

    Object.entries(req.body).forEach((param) => {
        if (newTours[index][param[0]]) {
            newTours[index][param[0]] = param[1]
        } else {
            res.status(404).json({
                status: 'fail',
                message: 'Invalid Params',
            })
        }
    })

    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(newTours),
        (err) => {
            res.status(201).json({
                status: 'success',
                requestTime: req.requestTime,
                body: {
                    tour: newTours[index],
                },
            })
        }
    )
}

module.exports.deleteTour = (req, res) => {
    const id = Number(req.params.id)

    const newTours = [...tours]

    const tourIndex = newTours.findIndex((t) => t.id === id)

    if (tourIndex > 0) {
        newTours.splice(tourIndex, 1)
    }

    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(newTours),
        (err) => {
            console.log(req)
            res.status(204).json({
                status: 'success',
                requestTime: req.requestTime,
                message: 'Tour has been deled successfully',
            })
        }
    )
}
