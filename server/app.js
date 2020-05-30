const express = require('express');
// const cors = require('cors');

const routes = require('./routes');

const app = express();

app.use(express.json());
// app.use(cors());

const loggingMiddleware = (req, res, next) => {
  console.log('Request at', req.originalUrl);
  next();
};

app.use('/', loggingMiddleware);
app.use('/', routes);

module.exports = app;
