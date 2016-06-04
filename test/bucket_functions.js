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
var ACCOUNTID2 = 'accountid2';
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

describe("Bucket Functions Call", function(){
    it.skip("should create bucket in correct operation", function(done){

        // INCORRECT BUCKET ADMIN OP
        options.path = '/' + ACCOUNTID + SYS_PATH + '/create_bucket2';
        options.method = 'POST';
        remote.request(options, {
          name: 'b_mybucket'
        })
        .then(function(responseString){

            //Response String should be like
            //{"queryType":"create_bucket","schema":"accountid","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}
            //|{"name":"b_mybucket"}


            var responseArray = responseString.split("|");
            var ast = responseArray[0];
            var query = JSON.parse(responseArray[1]);

            expect(ast).to.equal('false');
            expect(query.name).to.equal('b_mybucket');

        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

    it.skip("should create bucket", function(done){

        // CREATE BUCKET
        options.path = '/' + ACCOUNTID + SYS_PATH + '/create_bucket';
        options.method = 'POST';
        return remote.request(options, {
          name: 'b_mybucket'
        })
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"create_bucket","schema":"accountid","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}
            //|{"name":"b_mybucket"}


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = JSON.parse(responseArray[1]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('create_bucket');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(query.name).to.equal('b_mybucket');
        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

    it.skip("should write to bucket", function(done){



        options.path = '/' + ACCOUNTID + SYS_PATH + '/b_mybucket';
        options.method = 'POST';
        remote.request(options, '{"value": "Some data to write to the bucket..."}')
        .then(function(responseString){

            console.log(responseString);

            //Response String should be like
            //{"queryType":"insert","schema":"accountid","table":"b_mybucket","adminOp":false,"bucketOp":true,"user":"accountid","password":"password"}
            //|insert into accountid.b_mybucket(value) values("Some data to write to the bucket...");

            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = JSON.parse(responseArray[1]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('insert');
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

    it.skip("should select from bucket", function(done){

        // SELECT FROM BUCKET
        options.path = '/' + ACCOUNTID + '/b_mybucket';
        options.method = 'GET';
        remote.request(options, null)
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"select","schema":"accountid","table":"b_mybucket","sql":"select * from accountid.b_mybucket","adminOp":false,"bucketOp":true,"user":"accountid","password":"password"}


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = responseArray[1];

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('select');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(true);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(ast.table, 'topic [ast.table]').to.equal('b_mybucket');
            expect(ast.sql, 'topic [ast.sql]').to.equal('select * from accountid.b_mybucket');
        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

    it.skip("should drop bucket", function(done){

        // DROP BUCKET
        options.path = '/' + ACCOUNTID + SYS_PATH + '/drop_bucket';
        options.method = 'POST';
        remote.request(options, {
          name: 'b_mybucket'
        })
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"drop_bucket","schema":"accountid","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}
            //|{"name":"b_mybucket"}


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = JSON.parse(responseArray[1]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('drop_bucket');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(true);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(query.name).to.equal('b_mybucket');
        })
        .done(done, function (errObject) {
            console.log('ERROR',  errObject.message);
        });

    });

    it.skip("should grant bucket", function(done){

        // GRANT BUCKET
        options.path = '/' + ACCOUNTID + SYS_PATH + '/grant_bucket';
        options.method = 'POST';
        remote.request(options, {
          name: 'b_mybucket',
          accountId: ACCOUNTID2
        })
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"grant_bucket","schema":"accountid","adminOp":false,"bucketOp":true,"user":"accountid","password":"password"}
            //|{"name":"b_mybucket","accountId":"accountid2"}


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = JSON.parse(responseArray[1]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('grant_bucket');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(true);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(query.name).to.equal('b_mybucket');
            expect(query.accountId).to.equal('accountid2');
        })
        .done(done, function (errObject) {
            console.log('ERROR',  errObject.message);
            done();
        });

    });

    it.skip("should revoke bucket", function(done){

        // REVOKE BUCKET
        options.path = '/' + ACCOUNTID + SYS_PATH + '/revoke_bucket';
        options.method = 'POST';
        return remote.request(options, {
          name: 'b_mybucket',
          accountId: ACCOUNTID2
        })
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"revoke_bucket","schema":"accountid","adminOp":false,"bucketOp":true,"user":"accountid","password":"password"}
            //|{"name":"b_mybucket","accountId":"accountid2"}


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = JSON.parse(responseArray[1]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('revoke_bucket');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(true);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(query.name).to.equal('b_mybucket');
            expect(query.accountId).to.equal('accountid2');
        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });
});
