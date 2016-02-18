var Update = require('json2sql').Update;
var Insert = require('json2sql').Insert;

var json = '{"col1":22,"col2":"22","col3":33,"col4":"44"}{"col1":22,"col2":"22","col3":33,"col4":"44"}';

var Readable = require('stream').Readable;

console.log('--- Insert');
var rs1 = new Readable();
rs1.push(json);
rs1.push(null);
var ins = new Insert(null, 'db', 'table');
ins.on('error', console.log.bind(console));
rs1.pipe(ins).pipe(process.stdout);

setTimeout(function () {
  console.log('--- Insert that should fail');
  var rs1 = new Readable();
  rs1.push(json + '...');
  rs1.push(null);
  var ins = new Insert(null, 'db', 'table');
  ins.on('error', console.log.bind(console));
  rs1.pipe(ins).pipe(process.stdout);
}, 1000);

setTimeout(function () {
  console.log('--- Update');
  var rs2 = new Readable();
  rs2.push(json);
  rs2.push(null);
  var upd = new Update(null, 'db', 'table');
  upd.on('error', console.log.bind(console));
  rs2.pipe(upd).pipe(process.stdout);
}, 2000);

setTimeout(function () {
  console.log('--- Update that should fail');
  var rs2 = new Readable();
  rs2.push(json + '...');
  rs2.push(null);
  var upd = new Update(null, 'db', 'table');
  upd.on('error', console.log.bind(console));
  rs2.pipe(upd).pipe(process.stdout);
}, 3000);
