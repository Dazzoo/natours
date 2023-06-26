const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config({ path: '.env' })
const app = require('./index')

process.on('uncaughtException', (err) => {
    console.log('💥 ERROR: uncaughtException 💥')
    console.log(err)
    process.exit(1)
})

const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD)

mongoose.connect(DB).then((db) => {
    // console.log(db.connections)
    console.log('___________Connected to DB!____________')
})

const port = process.env.PORT

const server = app.listen(port, () => {
    console.log('App is running...')
})

process.on('unhandledRejection', (err) => {
    console.log('💥 ERROR: unhandledRejection 💥')
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})
