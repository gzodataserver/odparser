// OdParser is a readable stream that is created with a http request.
// It should buffer all data from the http request and
// should call push when both 'on end' has occurred and _read has been called
//
//```
// push_data()
//   if(req_end && read_called)  push
//
// _read()
//   read_called = true
//   push_data
//
// on_end()
//   req_end = true
//   push_data
//```


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

  self.on('finish', function() {
    error('finish in readable');
  });

  self.request = req;
  self.data = '';
  self.readCalled = false;
  self.reqEnded = false;

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

    self.reqEnded = true;
    self._pushData();
  });

};
util.inherits(RS, Readable);

RS.prototype._read = function () {
  this.readCalled = true;
  this._pushData();
};

RS.prototype._pushData = function() {
  if (this.readCalled && this.reqEnded) {
    this.readCalled = this.reqEnded = false;

    // write everything at once
    this.push(JSON.stringify(this.ast));

    // all data pushed
    this.push(null);
  }
};

// exports
// ======

module.exports = RS;
