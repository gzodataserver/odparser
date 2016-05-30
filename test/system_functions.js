'use strict';


// Import Helper

var remote = require('gzhelpers').remote;


//Import Chai Assertion Library

var expect = require('chai').expect; //BDD
var config = require('chai').config;

//Configure Chai

config.includeStack = false;
config.showDiff = false;


//Configure Tests

var ACCOUNTID2 = 'accountid2';
var ACCOUNTID = 'accountid';
var SYS_PATH = '/s';
var PASSWORD = 'password';
var EMAIL = 'joe@example.com'

var options = {
  hostname: 'localhost',
  port: 3000,
  method: 'POST',
  headers: {
    user: ACCOUNTID,
    database: ACCOUNTID, // I DON'T THINK THIS IS USED??
    password: PASSWORD
  }
};


//Test cases

describe("System Functions Call", function(){
    it("should reset password", function(done){

        options.path = '/' + ACCOUNTID + SYS_PATH + '/reset_password';

        remote.request(options, { accountId: ACCOUNTID, email: EMAIL })
        .then(function(responseString){

            //Response String should be like
            //{"queryType":"reset_password","schema":"accountid","adminOp":true,"bucketOp":false,"user":"accountid","password":"password"}|
            //{"accountId":"accountid","email":"joe@example.com"}


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = JSON.parse(responseArray[1]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('reset_password');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(true);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(query.accountId).to.equal('accountid');
            expect(query.email).to.equal(EMAIL);
        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

    it("should create table", function(done){

        options.path = '/' + ACCOUNTID + SYS_PATH + '/create_table';

        remote.request(options, {
          tableDef: {
            name: 'mytable',
            columns: ['col1 int', 'col2 varchar(255)']
          }
        })
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"create_table","schema":"accountid","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}
            //|{"tableDef":{"name":"mytable","columns":["col1 int","col2 varchar(255)"]}}


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = JSON.parse(responseArray[1]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('create_table');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(query.tableDef.name).to.equal('mytable');
            expect(query.tableDef.columns).to.deep.equal(["col1 int","col2 varchar(255)"]);
        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

    it("should drop table", function(done){

        // DROP TABLE
        options.path = '/' + ACCOUNTID + SYS_PATH + '/delete_table';
        options.method = 'POST';
        remote.request(options, {
          name: "mytable"
        })
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"create_table","schema":"accountid","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}
            //|{"tableDef":{"name":"mytable","columns":["col1 int","col2 varchar(255)"]}}


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = JSON.parse(responseArray[1]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('delete_table');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(query.name).to.equal('mytable');
        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

    it("should revoke", function(done){

        options.path = '/' + ACCOUNTID + SYS_PATH + '/revoke';
        options.method = 'POST';
        remote.request(options, {
          name: 'mytable',
          accountId: ACCOUNTID2
        })
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"revoke","schema":"accountid","adminOp":true,"bucketOp":false,"user":"accountid","password":"password"}
            //|{"name":"mytable","accountId":"accountid2"}


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = JSON.parse(responseArray[1]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('revoke');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(true);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(query.name).to.equal('mytable');
            expect(query.accountId).to.equal('accountid2');
        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

});
