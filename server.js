var http = require('http');
var OdParser = require('./odparser.js');

// HTTP server
// ==========

var server = http.Server();

server.on('request', function(req, res) {

  // TODO: need to figure out which query types to handle as streams
  // and whoch ones to just consume all data and then create SQL
  var data = '';
  req.on('data', function(chunk) { data += chunk });
  req.on('end', function(){console.log('end in request:', data)});

  res.on('finish', function(){console.log('finish in response')});

  console.log('processing request: ', req.url);
  var op = new OdParser();
  var ast = op.parseUri(req.method, req.url);
  res.write(JSON.stringify(ast));
  res.end();
});


// Plumming below ...
// ===================

server.on('clientError', function(exception, socket) {
  console.log('clientError occured ', exception);
});

server.on('close', function() {
  console.log('Closing http server');
});

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  server.close();
  setTimeout(process.exit, 1000);
});

process.on('exit', function(code) {
  console.log('About to exit with code:', code);
});

var port = 3000;
server.listen(port);
console.log('listening on port', port);
