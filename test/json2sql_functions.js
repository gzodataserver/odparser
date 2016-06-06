'use strict';


// Import Helper

var Update = require('../json2sql').Update;
var Insert = require('../json2sql').Insert;
var StoredProcedure = require('../json2sql').StoredProcedure;

var Readable = require('stream').Readable;
var Writable = require('stream').Writable;


//Import Chai Assertion Library

var expect = require('chai').expect; //BDD
var config = require('chai').config;

//Configure Chai

config.includeStack = false;
config.showDiff = false;


//Global Variables

var json = '{"col1":22,"col2":"22","col3":33,"col4":"44"}{"col1":22,"col2":"22","col3":33,"col4":"44"}';

//Test cases

describe("JSON 2 SQL", function(){
    it("should convert json to insert sql", function(done){

        var readableStream = new Readable();
        var writableStream = new Writable();
        var response = '';

        readableStream.push(json);
        readableStream.push(null);
        var insertTransform = new Insert(null, 'db', 'table');
        insertTransform.on('error', console.log.bind(console));

        writableStream._write = function (chunk, encoding, done) {
            response += chunk.toString();
            done();
        };

        writableStream.on('finish', function () {
          expect(response).to.equal('insert into db.table(col1,col2,col3,col4) values(22,"22",33,"44");insert into db.table(col1,col2,col3,col4) values(22,"22",33,"44");');
          done();

        });

        readableStream.pipe(insertTransform).pipe(writableStream);

    });

    it("should fail to convert json to insert sql", function(done){

        var readableStream = new Readable();
        var writableStream = new Writable();
        var response = '';

        readableStream.push(json + '...');
        readableStream.push(null);
        var insertTransform = new Insert(null, 'db', 'table');
        insertTransform.on('error', function(){
            //As this should fail
            done();
        });

        writableStream._write = function (chunk, encoding, doneWritting) {
            response += chunk.toString();
            doneWritting();
        };

        writableStream.on('finish', function () {
          expect(response).to.not.equal('insert into db.table(col1,col2,col3,col4) values(22,"22",33,"44");insert into db.table(col1,col2,col3,col4) values(22,"22",33,"44");');
        });

        readableStream.pipe(insertTransform).pipe(writableStream);

    });

    it("should convert json to update sql", function(done){

        var readableStream = new Readable();
        var writableStream = new Writable();
        var response = '';

        readableStream.push(json);
        readableStream.push(null);
        var updateTransform = new Update(null, 'db', 'table');
        updateTransform.on('error', console.log.bind(console));

        writableStream._write = function (chunk, encoding, done) {
            response += chunk.toString();
            done();
        };

        writableStream.on('finish', function () {
          expect(response).to.equal('update db.table set col1=22,col2=22,col3=33,col4=44;update db.table set col1=22,col2=22,col3=33,col4=44;');
          done();
        });

        readableStream.pipe(updateTransform).pipe(writableStream);

    });

    it("should fail to convert json to update sql", function(done){

        var readableStream = new Readable();
        var writableStream = new Writable();
        var response = '';

        readableStream.push(json + '...');
        readableStream.push(null);
        var updateTransform = new Update(null, 'db', 'table');
        updateTransform.on('error', function(){
            done();
        });

        writableStream._write = function (chunk, encoding, doneWritting) {
            response += chunk.toString();
            doneWritting();
        };

        writableStream.on('finish', function () {
          expect(response).to.not.equal('update db.table set col1=22,col2=22,col3=33,col4=44;update db.table set col1=22,col2=22,col3=33,col4=44;');
        });

        readableStream.pipe(updateTransform).pipe(writableStream);

    });

    it("should convert json to stored procedure sql", function(done){

        //var readableStream = new Readable();
        //var writableStream = new Writable();
        var response = '';

        var spWritable = new StoredProcedure(null, 'db');
        spWritable.on('error', console.log.bind(console));
        spWritable.write('{procedure: "spMyStringyStoredProcedure", params: ["Hodor","Winterfel"]}');

        spWritable.on('finish', function () {
          expect(response).to.equal('update db.table set col1=22,col2=22,col3=33,col4=44;update db.table set col1=22,col2=22,col3=33,col4=44;');
          done();
        });


    });

    it("should fail to convert json to stored procedure sql", function(done){

        var readableStream = new Readable();
        var writableStream = new Writable();
        var response = '';

        readableStream.push(json + '...');
        readableStream.push(null);
        var updateTransform = new Update(null, 'db', 'table');
        updateTransform.on('error', function(){
            done();
        });

        writableStream._write = function (chunk, encoding, doneWritting) {
            response += chunk.toString();
            doneWritting();
        };

        writableStream.on('finish', function () {
          expect(response).to.not.equal('update db.table set col1=22,col2=22,col3=33,col4=44;update db.table set col1=22,col2=22,col3=33,col4=44;');
        });

        readableStream.pipe(updateTransform).pipe(writableStream);

    });
});
