const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const express = require('express')

const app = express()

dotenv.config({ path: '.env' })

const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD)

mongoose.connect(DB).then((db) => {
    // console.log(db.connections)
    console.log('___________Connected to DB!____________')
})

const port = process.env.PORT

app.listen(port, () => {
    console.log('App is running...')
})

async function BcryptPasswords() {
    console.log(
        await Promise.all(
            [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                19, 20, 21, 22, 23, 24, 25,
            ].map(async (n) => await bcrypt.hash('qwerty123', 12))
        )
    )
}

BcryptPasswords()
