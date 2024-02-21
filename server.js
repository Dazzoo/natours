const dotenv = require('dotenv');
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');

dotenv.config({ path: '.env' });
const app = require('./index');

process.on('uncaughtException', (err) => {
    console.log('💥 ERROR: uncaughtException 💥');
    console.log(err);
    process.exit(1);
});

const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DB).then((db) => {
    console.log('___________Connected to DB!____________');
});

const port = process.env.PORT;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
    const options = {
        key: fs.readFileSync('./privkey.pem'),
        cert: fs.readFileSync('./cert.pem'),
    };

    const server = https.createServer(options, app).listen(port, () => {
        console.log('App is running with HTTPS...');
    });
} else {
    const server = app.listen(port, () => {
        console.log('App is running...');
    });
}

process.on('unhandledRejection', (err) => {
    console.log('💥 ERROR: unhandledRejection 💥');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});