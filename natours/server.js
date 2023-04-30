const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config({ path: '.env' })
const app = require('./index')

const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD)

mongoose.connect(DB).then((db) => {
    console.log(db.connections)
    console.log('___________Connected!____________')
})

const port = process.env.PORT

app.listen(port, () => {
    console.log('App is running...')
})
