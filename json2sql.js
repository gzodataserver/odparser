// imports
// ========

var u = require('underscore');

// json2sql
// ========

h = {};

h.json2insert = function(database, tableName, data) {

  // separate keys (columns names) and values into separate strings
  // values have quotes but column names don't
  var k = u.keys(data).join(',');
  var v = JSON.stringify(u.values(data));

  // Skip [ and ] characters in string
  v = v.substring(1, v.length - 1);

  // The insert query
  var insert = 'insert into ' + database + '.' + tableName +
    '(' + k + ') values(' + v + ')';
  return insert;
};

// build update sql from json object
h.json2update = function(database, tableName, data) {

  // {k1: v1, k2: v2} -> k1=v1,k2=v2
  var str = u.map(data, function(k, v) {
    return v + '=' + k;
  }).join(',');

  // The update query
  var update = 'update ' + database + '.' + tableName + ' set ' + str;
  return update;
};

// exports
// =======

module.exports = h;
