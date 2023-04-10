const dotenv = require('dotenv')
dotenv.config({path: '.env'})
const app = require('./index')

const port = process.env.PORT

app.listen(port, () => {
    console.log('App is running...')
})
