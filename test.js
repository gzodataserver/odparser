// Imports
// =======

var ODataUri2Sql = require('./index.js');

// Setup logging
// =============

var log = console.log.bind(console);
var debug = console.log.bind(console, 'DEBUG');
var info = console.info.bind(console);
var error = console.error.bind(console);



// Tests
// =====

var op = new ODataUri2Sql();

var res = op.parseUri2('GET','http://localhost/accountid')
log('RESULT', res);
