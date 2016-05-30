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

describe("Account Functions Call", function(){

    it("should create account", function(done){

        options.path = '/create_account';
        options.method = 'POST';

        remote.request(options, {
            email: EMAIL
          })
        .then(function(responseString){

            //Response String should be like
            //{"queryType":"create_account","adminOp":true,"bucketOp":false,"user":"accountid","password":"password"}
            //|{"email":"joe@example.com"}


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = JSON.parse(responseArray[1]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('create_account');
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(true);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(query.email).to.equal(EMAIL);
        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });


    it("should delete account", function(done){

        options.path = '/' + ACCOUNTID + SYS_PATH + '/delete_account';
        options.method = 'POST';
        remote.request(options, {
          email: EMAIL
        })
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"delete_account","schema":"accountid","adminOp":true,"bucketOp":false,"user":"accountid","password":"password"}
            //|{"email":"joe@example.com"}


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = JSON.parse(responseArray[1]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('delete_account');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(true);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(query.email).to.equal(EMAIL);
        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });
});
