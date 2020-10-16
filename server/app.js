/**
/* Main app module
/ */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const routes = require('routes/index.routes');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: 'true' }));
app.use(bodyParser.json());

app.use(cors());
app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error('error', err);

  res.status(err.status || 500);
  res.send(err.showMessage ? err.message : 'error');
});

module.exports = app;
