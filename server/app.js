/**
/* Main app module
/ */

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser'); // pull information from HTML POST (express4)
const methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

const app = express();
const routes = require('@server/routes/index.routes');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: 'true' })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// All routes get mounted below the 'api' path
app.use('/api', routes);

/**
 * Error handling middleware, see:
 *
 * https://derickbailey.com/2014/09/06/proper-error-handling-in-expressjs-route-handlers/
 */
app.use((err, req, res, next) => {
  console.error('error', err);

  res.status(err.status || 500);
  res.send(err.showMessage ? err.message : 'error');
});

module.exports = app;
