// imports
// =======

var OdUriParser = require('./oduriparser.js');
var util = require('util');

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
    'service_def', 'grant', 'revoke'
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

OdParser = function () {
  OdUriParser.call(this);
};
util.inherits(OdParser, OdUriParser);

OdParser.prototype.parseReq = function (req) {
  var ast = this.parseUri(req.method, req.url);

  ast.adminOp = isAdminOp(ast.queryType);
  ast.bucketOp = isBucketOp(ast.queryType, ast.table);

  if (req.headers.hasOwnProperty('user'))
    ast.user = req.headers.user;

  if (req.headers.hasOwnProperty('password'))
    ast.password = req.headers.password;

  return ast;
};

OdParser.handleRequest = function (req, res, next) {
  req.ast = new OdParser().parseReq(req);
  next();
};

// exports
// ======

module.exports = OdParser;
