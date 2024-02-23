const dotenv = require('dotenv');
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const next = require('next');
const api = require('./index');

dotenv.config({ path: '.env' });

process.on('uncaughtException', (err) => {
  console.log('💥 ERROR: uncaughtException 💥');
  console.log(err);
  process.exit(1);
});

const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DB).then((db) => {
  console.log('Connected to DB!');
});

const port = process.env.PORT;
const isProduction = process.env.NODE_ENVIRONMENT === 'production';

const app = next({ dev: !isProduction, dir: '../natours-frontend' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Your existing Express routes go here
  server.use('/api', api);

  // Add a custom route for Next.js rendering
  server.get('*', (req, res) => {   
    return handle(req, res);
  });

  if (isProduction) {
    const options = {
      key: fs.readFileSync('./privkey.pem'),
      cert: fs.readFileSync('./cert.pem'),
    };
  
    https.createServer(options, server).listen(port, () => {
      console.log('App is running with HTTPS...');
    });
  } else {
    server.listen(port, () => {
      console.log('App is running...');
    });
  }
});

process.on('unhandledRejection', (err) => {
  console.log('💥 ERROR: unhandledRejection 💥');
  console.log(err.name, err.message);
  process.exit(1);
});