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

describe("SQL INSERT", function(){
    it("should convert odata request to insert to SQL with numeric and string parameters", function(done){

        options.path = '/' + ACCOUNTID + '/mytable';

        remote.request(options, {
          col1: 22,
          col2: '22'
        })
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"insert","schema":"accountid","table":"mytable","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}
            //|insert into accountid.mytable(col1,col2) values(22,"22");


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = responseArray[1];

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('insert');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.table, 'topic [ast.table]').to.equal('mytable');
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(query).to.equal('insert into accountid.mytable(col1,col2) values(22,"22");');
        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

});
