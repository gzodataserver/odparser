'use strict';


// Import Helper

var remote = require('gzhelpers').remote;
var querystring = require("querystring");


//Import Chai Assertion Library

var expect = require('chai').expect; //BDD
var config = require('chai').config;

//Configure Chai

config.includeStack = false;
config.showDiff = false;


//Configure Tests

var ACCOUNTID = 'accountid';
var PASSWORD = 'password';

var options = {
  hostname: 'localhost',
  port: 3000,
  method: 'GET',
  headers: {
    user: ACCOUNTID,
    database: ACCOUNTID, // I DON'T THINK THIS IS USED??
    password: PASSWORD
  }
};


//Test cases

describe("SQL SELECT", function(){
    it("should convert odata request to select to SQL with no where and orderby filters", function(done){

        options.path = '/' + ACCOUNTID + '/mytable';

        remote.request(options, null)
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"select","schema":"accountid","table":"mytable","sql":"select * from accountid.mytable","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}|


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('select');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.table, 'topic [ast.table]').to.equal('mytable');
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);
            expect(ast.sql, 'topic [ast.sql]').to.equal('select * from accountid.mytable');

        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

    it("should convert odata request to select to SQL with filter, order by and skip", function(done){

        // FILTER & ORDER BY
        var params = querystring.stringify({
          $select: 'col1,col2',
          $filter: 'co1 eq "help"',
          $orderby: 'col2',
          $skip: '10'
        });

        options.path = '/' + ACCOUNTID + '/table?' + params;
        options.method = 'GET';
        remote.request(options, null)
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"select","schema":"accountid","table":"table","sql":"select col1,col2 from accountid.table where co1 = \"help\" order by col2 limit 10,100","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}|


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('select');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.table, 'topic [ast.table]').to.equal('table');
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);
            expect(ast.sql, 'topic [ast.sql]').to.equal("select col1,col2 from accountid.table where co1 = \"help\" order by col2 limit 10,100");

        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

    it("should convert odata request to select to SQL with columns filter with comparision operators and order by", function(done){

        // FILTER, COLS, ORDER BY
        var params = querystring.stringify({
          $select: 'col1,col2',
          $filter: 'Price add 5 gt 10',
          $orderby: 'col2'
        });
        options.path = '/' + ACCOUNTID + '/table?' + params;
        options.method = 'GET';
        return remote.request(options, null)
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"select","schema":"schema","table":"table","sql":"select col1,col2 from schema.table where Price + 5 > 10 order by col2","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}|


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('select');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.table, 'topic [ast.table]').to.equal('table');
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);
            expect(ast.sql, 'topic [ast.sql]').to.equal('select col1,col2 from accountid.table where Price + 5 > 10 order by col2');

        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

    it("should convert odata request to select to SQL with order by", function(done){

        // ORDER BY
        var params = querystring.stringify({
          $orderby: 'col2'
        });
        options.path = '/accountid/table?' + params;
        options.method = 'GET';
        remote.request(options, null)
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"select","schema":"schema","table":"table","sql":"select * from schema.table order by col2","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}|


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('select');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.table, 'topic [ast.table]').to.equal('table');
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);
            expect(ast.sql, 'topic [ast.sql]').to.equal('select * from accountid.table order by col2');

        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

    it("should convert odata request to select to SQL with skip", function(done){

        // FILTER & ORDER BY
        var params = querystring.stringify({
          $select: 'col1,col2,@odata.etag',
          $filter: 'co1 eq "help"',
          $orderby: 'col2',
          $skip: '10'
        });

        options.path = '/' + ACCOUNTID + '/table?' + params;
        options.method = 'GET';

        remote.request(options, null)
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"select","schema":"schema","table":"table","etagCols":"col1,col2,","sql":"select * from schema.table where co1 = \"help\" order by col2 limit 10,100","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}|


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('select');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.table, 'topic [ast.table]').to.equal('table');
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);
            expect(ast.sql, 'topic [ast.sql]').to.equal('select * from accountid.table where co1 = \"help\" order by col2 limit 10,100');

        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

});


describe("SQL DESC", function(){
    it("should convert odata request for table metadata to SQL", function(done){

        options.path = '/' + ACCOUNTID + '/mytable/$metadata';
        options.method = 'GET';
        return remote.request(options, null)
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"metadata","schema":"accountid","table":"mytable","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}|


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('metadata');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.table, 'topic [ast.table]').to.equal('mytable');
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

});
