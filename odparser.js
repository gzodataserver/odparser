// imports
// =======

var util = require('util');
var Readable = require('stream').Readable;
var OdUriParser = require('./oduriparser.js');

// Setup logging
// =============

var log = console.log.bind(console);
var debug = console.log.bind(console, 'DEBUG');
var info = console.info.bind(console);
var error = console.error.bind(console);

// Some constants and helpers
// =========================

var BUCKER_PREFIX = 'b_';

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


// OdParser class - a readable stream (not a transform) based on a http request
// ============================================================================

RS = function (req, options) {
  var self = this;

  Readable.call(self, options);

  // wait until all data has been read from the http request
  self.pause();

  self.on('finish', function() {
    error('finish in readable');
  });

  self.request = req;
  self.data = '';

  log('processing request: ', req.url);
  var op = new OdUriParser();
  self.ast = op.parseUri(req.method, req.url);

  if (req.headers.hasOwnProperty('user'))
    self.ast.user = req.headers.user;

  if (req.headers.hasOwnProperty('password'))
    self.ast.password = req.headers.password;

  if (isPipeOp(self.ast.queryType)) {
    debug('Pipe operation');
  } else {
    debug('Non-pipe operation');
  }

  req.on('data', function (chunk) {
    chunk = chunk.toString();
    self.data += chunk;
  });

  req.on('end', function () {
    self.ast.admin_op = isAdminOp(self.ast.queryType);
    self.ast.bucket_op = isBucketOp(self.ast.queryType, self.ast.table);

    // parse data as json if it isn't a bucket operation
    if (self.data !== '' && !self.ast.bucket_op) {
      try {
        self.data = JSON.parse(self.data);
      } catch (e) {
        var msg = 'ERROR: could not parse data into JSON - ' + self.data;
        error(msg);
        self.ast.data = msg;
      }
    }
    self.ast.data = self.data;

    // consumed all data in http request, now can data be read from this stream
    self.resume();

    log('end in request, data:', self.data);
    log('ast:', self.ast);

  });

};
util.inherits(RS, Readable);

RS.prototype._read = function () {
  log('in _read:', this.ast)
  // write everything at once
  this.push(JSON.stringify(this.ast));

  // all data pushed
  this.push(null);
};

// exports
// ======

module.exports = RS;
