var Update = require('json2sql').Update;
var Insert = require('json2sql').Insert;

var json = '{"col1":22,"col2":"22","col3":33,"col4":"44"}{"col1":22,"col2":"22","col3":33,"col4":"44"}';

var Readable = require('stream').Readable;

console.log('--- Insert');
var rs1 = new Readable();
rs1.push(json);
rs1.push(null);
rs1.pipe(new Insert(null,'db','table')).pipe(process.stdout);

setTimeout(function(){
    console.log('--- Update');
    var rs2 = new Readable();
    rs2.push(json);
    rs2.push(null);
    rs2.pipe(new Update(null,'db','table')).pipe(process.stdout);    
}, 1000);
