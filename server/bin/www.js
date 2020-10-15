#!/usr/bin/env node

/**
/* Bootstrap the server/app
*/
require('module-alias/register');
const config = require('../../bim-contracts.config');

const app = require('@server/app');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {
  mongodb: { uri, autoIndex },
} = config;
logDebug('mongo: ' + uri + ' autoIndex: ' + autoIndex);
mongoose.connect(uri, {
  config: { autoIndex },
});

mongoose.connection.on('error', () => {
  console.error(
    'MongoDB connection error. Please make sure MongoDB is running.'
  );
  process.exit();
});

const port = normalizePort(config.server.port || 3000);
app.set('port', port);

const http = require('http');
const server = http.createServer(app);

// Listen on provided port, on all network interfaces
server.listen(port);

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  logDebug('Listening on ' + bind);
}

function logDebug(message) {
  if (process.env.NODE_ENV === 'development') {
    console.log(message);
  }
}
