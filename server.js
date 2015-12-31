// Imports
// =======

var http = require('http');
var OdUriParser = require('./oduriparser.js');

// Setup logging
// =============

var log = console.log.bind(console);
var debug = console.log.bind(console, 'DEBUG');
var info = console.info.bind(console);
var error = console.error.bind(console);

// Some constants
// ==============

var BUCKER_PREFIX = 'b_';

// HTTP server
// ==========

// Check if operation requires admin credentials
var isAdminOp = function (op) {
  return ['create_account', 'reset_password', 'delete_account',
    'create_table', 'service_def', 'grant', 'revoke', 'delete_table'
  ].indexOf(op) !== -1;
};

// Check if operation should be piped
var isPipeOp = function (op) {
  return ['insert', 'update'].indexOf(op) !== -1;
};

var isBucketOp = function (op, table) {
  // let all operations be valid bucket operations
  // !!table === true|false and not undefined
  return (!!table && table.substr(0, 2) === BUCKER_PREFIX);
};

var S = {};

S.run = function (cb) {

  var server = http.Server();

  server.on('request', function (req, res) {

    log('processing request: ', req.url);
    var op = new OdUriParser();
    var ast = op.parseUri(req.method, req.url);

    if (req.headers.hasOwnProperty('user'))
      ast.user = req.headers.user;

    if (req.headers.hasOwnProperty('password'))
      ast.password = req.headers.password;

    if (isPipeOp(ast.queryType)) {
      debug('Pipe operation');
    } else {
      debug('Non-pipe operation');
    }

    var data = '';
    req.on('data', function (chunk) {
      data += chunk
    });

    req.on('end', function () {
      log('end in request, data:', data);

      ast.admin_op = isAdminOp(ast.queryType);
      ast.bucket_op = isBucketOp(ast.queryType, ast.table);
      log(ast);

      // parse data as json if it isn't a bucket operation
      if (data !== '' && !ast.bucket_op) {
        try {
          data = JSON.parse(data);
        } catch (e) {
          var msg = 'ERROR: could not parse data into JSON - ' + data;
          error(msg);
          ast.data = msg;
        }
      }
      ast.data = data;

      // TODO: make action configurable, or make this pipeable stream
      res.write(JSON.stringify(ast));
      res.end();
    });

    res.on('finish', function () {
      log('finish in response')
    });

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

};

module.exports = S;
