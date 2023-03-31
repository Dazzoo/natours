const express = require('express')
const fs = require('fs')

const app = express()

app.use(express.json())

const port = 6969

app.listen(port, () => {
    console.log('App is running...')
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)

const getTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length - 1,
        requestTime: req.requestTime,
        data: {
            tours,
        },
    })
}

const getTourById = (req, res) => {
    let id = Number(req.params.id)

    let tour = tours.find((t) => t.id === id)

    if (!tour) {
        if (id > tours.length) {
            res.status(404).json({
                status: 'fail',
                message: 'Invalid tour ID',
            })
        } else {
            res.status(404).json({
                status: 'fail',
                message: 'Something went wrong',
            })
        }
    } else {
        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            body: {
                tour,
            },
        })
    }
}

const createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1
    const newObj = Object.assign({ id: newId }, req.body)

    tours.push(newObj)

    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            res.status(201).json({
                status: 'success',
                requestTime: req.requestTime,
                data: {
                    tour: newObj,
                },
            })
        }
    )
}

const editTourParamById = (req, res) => {
    let id = Number(req.params.id)

    let tour = tours.find((t) => t.id === id)

    if (!tour) {
        if (id > tours.length) {
            res.status(404).json({
                status: 'fail',
                message: 'Invalid tour ID',
            })
        } else {
            res.status(404).json({
                status: 'fail',
                message: 'Something went wrong',
            })
        }
    } else {
        let newTours = [...tours]

        let index = newTours.findIndex((t) => t.id === id)

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
}

const deleteTour = (req, res) => {
    let id = Number(req.params.id)

    let newTours = [...tours]

    let tourIndex = newTours.findIndex((t) => t.id === id)

    if (tourIndex > 0) {
        newTours.splice(tourIndex, 1)
    }

    if (!(tourIndex > 0)) {
        if (id > tours.length) {
            res.status(404).json({
                status: 'fail',
                message: 'Invalid tour ID',
            })
        } else {
            res.status(404).json({
                status: 'fail',
                message: 'Something went wrong',
            })
        }
    } else {
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
}

app.route('/api/v1/tours')
    .get(getTours)
    .post(createTour)

app.route('/api/v1/tours/:id')
    .get(getTourById)
    .patch(editTourParamById)
    .delete(deleteTour)