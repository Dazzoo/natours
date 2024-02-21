const dotenv = require('dotenv');
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');

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

    // Serve static files from the Next.js app
    app.use(express.static(path.join(__dirname, '../natours-frontend')));

    // The "catchall" handler: for any request that doesn't
    // match one above, send back Next.js's index.html file.
    app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../natours-frontend', 'index.html'));
    });

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