// Transform json into sql for insert and update (using streams)


// imports
// ========

var util = require('util');
var Transform = require('stream').Transform;
var Writable = require('stream').Writable;

var u = require('underscore');
var Parser = require('jsonparse');

// Setup logging
// =============

var log = console.log.bind(console);
var debug = console.log.bind(console, 'DEBUG');
var info = console.info.bind(console);
var error = console.error.bind(console);

// update
// ======

util.inherits(TS1, Transform);

function TS1(options, db, table) {
  var self = this;

  if (!(this instanceof TS1))
    return new TS1(options);

  Transform.call(this, options, db, table);

  this.on('finish', function () {
    debug('finish in transform');
  });

  this.p = new Parser();
  this.p.onValue = function (value) {
    // this refers to the Parser's this (not the stream)
    if (this.stack.length === 0) {
      self.push(json2update(db, table, value));
    }
  };
};

TS1.prototype._transform = function (chunk, encoding, done) {
  try {
    this.p.write(chunk.toString());
  } catch (e) {
    var msg = 'ERROR in json2sql.Update, likely invalid JSON: ' + e;
    this.emit('error', msg);
  }
  done();
};

// build update sql from json object
json2update = function (database, tableName, data) {

  // {k1: v1, k2: v2} -> k1=v1,k2=v2
  var str = u.map(data, function (k, v) {
    return v + '=' + k;
  }).join(',');

  // The update query
  var update = 'update ' + database + '.' + tableName + ' set ' + str + ';';
  return update;
};

// insert
// ======

util.inherits(TS2, Transform);

function TS2(options, db, table) {
  var self = this;

  if (!(this instanceof TS2))
    return new TS2(options);

  Transform.call(this, options, db, table);

  this.on('finish', function () {
    debug('finish in transform');
  });

  this.p = new Parser();
  this.p.onValue = function (value) {
    // this refers to the Parser's this (not the stream)
    if (this.stack.length === 0) {
      self.push(json2insert(db, table, value));
    }
  };
};

TS2.prototype._transform = function (chunk, encoding, done) {
  try {
    this.p.write(chunk.toString());
  } catch (e) {
    var msg = 'ERROR in json2sql.Insert, likely invalid JSON: ' + e;
    this.emit('error', msg);
  }
  done();
};

json2insert = function (database, tableName, data) {

  // separate keys (columns names) and values into separate strings
  // values have quotes but column names don't
  var k = u.keys(data).join(',');
  var v = JSON.stringify(u.values(data));

  // Skip [ and ] characters in string
  v = v.substring(1, v.length - 1);

  // The insert query
  var insert = 'insert into ' + database + '.' + tableName +
    '(' + k + ') values(' + v + ');';
  return insert;
};

// stored procedure
// ======

util.inherits(TS3, Writable);

function TS3(options, db) {
  var self = this;

  if (!(this instanceof TS3))
    return new TS3(options);

  Writable.call(this, options, db);

  this.on('finish', function () {
    debug('finish in write');
  });

  this.p = new Parser();
  this.p.onValue = function (value) {
    // this refers to the Parser's this (not the stream)
    if (this.stack.length === 0) {
      self.push(json2sp(db, value.procedure, value.params));
    }
  };
};

TS3.prototype._write = function (chunk, encoding, done) {
  try {
    this.p.write(chunk.toString());
  } catch (e) {
    var msg = 'ERROR in json2sql.StoredProcedure, likely invalid JSON: ' + e;
    this.emit('error', msg);
  }
  done();
};

json2sp = function (db, spname, params) {

  // separate keys (columns names) and values into separate strings
  // values have quotes but column names don't

  k =  params.map(function(item){
    return (typeof item === 'string')? "'" + item + "'" :item;
  }).join(',');

  // The sp call
  var sp = 'CALL ' + db + '.' + spname +
    '(' + k + ')';
  return sp;
};

// exports
// =======

module.exports = {};
module.exports.Update = TS1;
module.exports.Insert = TS2;
module.exports.StoredProcedure = TS3;
