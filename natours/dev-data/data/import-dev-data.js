const dotenv = require('dotenv')
const mongoose = require('mongoose')
const express = require('express')
const fs = require('fs')
const Tour = require('../../models/tourModel')

const app = express()

dotenv.config({ path: '.env' })

const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD)

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`))

console.log(tours)

mongoose.connect(DB).then((db) => {
    // console.log(db.connections)
    console.log('___________Connected to DB!____________')
})

const port = process.env.PORT

app.listen(port, () => {
    console.log('App is running...')
})

const importData = async () => {
    try {
        await Tour.create(tours)
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

const deleteData = async () => {
    try {
        await Tour.deleteMany()
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}

console.log(process.argv)
