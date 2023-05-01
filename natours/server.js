const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config({ path: '.env' })
const app = require('./index')

const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD)

mongoose.connect(DB).then((db) => {
    // console.log(db.connections)
    console.log('___________Connected!____________')
})

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
    },
    rating: {
        type: Number,
        required: false,
        default: 4.5,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
})

const Tour = mongoose.model('Tour', tourSchema)
console.log(Tour)

const port = process.env.PORT

app.listen(port, () => {
    console.log('App is running...')
})
