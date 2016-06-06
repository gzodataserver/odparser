// Imports
// =======

var http = require('http');
var OdParser = require('./odparser.js').OdParser;

var Update = require('./odparser').json2sql.Update;
var Insert = require('./odparser').json2sql.Insert;
var StoredProcedure = require('./odparser').json2sql.StoredProcedure;

// Setup logging
// =============

var log = console.log.bind(console);
var debug = console.log.bind(console, 'DEBUG');
var info = console.info.bind(console);
var error = console.error.bind(console);

// HTTP server
// ==========

var server = http.Server();

server.on('request', function (req, res) {
  var handleError = function (err) {
    res.write(err);
    error(err);
  };

  req.on('close', function () {
    console.log('close in request')
  });
  res.on('finish', function () {
    console.log('finish in response')
  });

  console.log('processing request: ', req.url);
  var ast = new OdParser().parseReq(req);
  res.write(JSON.stringify(ast));
  res.write("|");
  if (ast.queryType === 'insert' && !ast.bucket_op) {
    var ins = new Insert(null, ast.schema, ast.table);
    ins.on('error', handleError);
    req.pipe(ins).pipe(res);
  } else if (ast.queryType === 'update') {
    var upd = new Update(null, ast.schema, ast.table);
    upd.on('error', handleError);
    req.pipe(upd).pipe(res);
} else if (ast.queryType === 'exec') {
    var sp = new StoredProcedure(null, ast.schema);
    sp.on('error', handleError);
    req.pipe(sp).pipe(res);
  } else req.pipe(res);
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
