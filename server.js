// Imports
// =======

var http = require('http');
var OdParser = require('./odparser.js');

// Setup logging
// =============

var log = console.log.bind(console);
var debug = console.log.bind(console, 'DEBUG');
var info = console.info.bind(console);
var error = console.error.bind(console);

// HTTP server
// ==========

var server = http.Server();

server.on('request', function(req, res) {
  res.on('finish', function(){console.log('finish in response')});

  (new OdParser(req)).pipe(res);
});


// Plumming below ...
// ===================

server.on('clientError', function (exception, socket) {
  log('clientError occured ', exception);
});

server.on('close', function () {
  log('Closing http server');
});

process.on('SIGINT', function () {
  log("Caught interrupt signal");
  server.close();
  setTimeout(process.exit, 1000);
});

process.on('exit', function (code) {
  log('About to exit with code:', code);
});

var port = 3000;
server.listen(port);
log('listening on port', port);
