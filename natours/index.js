const express = require('express')
const fs = require('fs')

const app = express()

app.use(express.json())

const port = 6969

app.listen(port, () => {
    console.log('App is running...')
})

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)

// app.get('/', (req, res) => {
//     res.status(200).json({ message: 'Hello from server side', name: 'Natours' })
// })

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length - 1,
        data: {
            tours,
        },
    })
})

app.get('/api/v1/tours/:id', (req, res) => {
    let id = Number(req.params.id)

    let tour = tours.find((t) => t.id === id)

    if (!tour) {
        if (id > tours.length) {
            res.status(404).json({
                status: 'fail',
                message: 'Invalid tour ID',
            })
        }
    } else {
        res.status(200).json({
            status: 'success',
            body: {
                tour,
            },
        })
    }

    res.send('End')
})

app.post('/api/v1/tours', (req, res) => {
    const newId = tours[tours.length - 1].id + 1
    const newObj = Object.assign({ id: newId }, req.body)

    tours.push(newObj)

    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            res.status(201).json({
                status: 'success',
                data: {
                    tour: newObj,
                },
            })
        }
    )
})
