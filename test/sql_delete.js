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
  method: 'PUT',
  headers: {
    user: ACCOUNTID,
    database: ACCOUNTID, // I DON'T THINK THIS IS USED??
    password: PASSWORD
  }
};


//Test cases

describe("SQL DELETE", function(){
    it("should convert odata request to update to SQL ", function(done){

        var filter = querystring.stringify({
          $filter: 'col1 eq 22'
        });
        options.path = '/' + ACCOUNTID + '/mytable?' + filter;
        options.method = 'DELETE';
        remote.request(options, {
          name: 'mytable',
          accountId: ACCOUNTID
        })
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"delete","schema":"accountid","table":"mytable","sql":" where col1 = 22","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}
            //|{"name":"mytable","accountId":"accountid"}


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = JSON.parse(responseArray[1]);

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('delete');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.table, 'topic [ast.table]').to.equal('mytable');
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);
            expect(ast.sql, 'topic [ast.sql]').to.equal(" where col1 = 22");

            expect(query.name).to.equal('mytable');
            expect(query.accountId).to.equal('accountid');
        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

});
