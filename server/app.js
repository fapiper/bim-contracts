const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { handleError } = require('./helpers/error');
const routes = require('./routes');

const app = express();
const errorMiddleware = (err, req, res, next) => handleError(err, res);

app.use(express.json());
app.use(cors());

app.use(morgan('dev'));
app.use('/', errorMiddleware);
app.use('/', routes);

module.exports = app;
