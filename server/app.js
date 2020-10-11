const express = require('express');
const morgan = require('morgan');

const { handleError } = require('./helpers/error');
const routes = require('./routes');

const app = express();

const errorMiddleware = (err, req, res, next) => handleError(err, res);

app.use(morgan('dev'));

app.use('/', errorMiddleware);
app.use('/', routes);

module.exports = app;
