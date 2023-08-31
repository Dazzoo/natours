const dotenv = require('dotenv')
const mongoose = require('mongoose')
const express = require('express')
const fs = require('fs')
const Tour = require('../../models/tourModel')
const Review = require('../../models/reviewModel')
const User = require('../../models/userModel')

const app = express()

dotenv.config({ path: '.env' })

const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD)

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`))

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
        await Review.create(reviews)
        await User.create(users, { validateBeforeSave: false })
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

const deleteData = async () => {
    try {
        await Tour.deleteMany()
        await Review.deleteMany()
        await User.deleteMany()
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
