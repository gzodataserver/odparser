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

describe("SQL UPDATE", function(){
    it("should convert odata request to update to SQL ", function(done){

        options.path = '/' + ACCOUNTID + '/mytable';

        remote.request(options, {
          col2: '33'
        })
        .then(function(responseString){

            //console.log(responseString);

            //Response String should be like
            //{"queryType":"update","schema":"accountid","table":"mytable","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}
            //|update accountid.mytable set col2=33;


            var responseArray = responseString.split("|");
            var ast = JSON.parse(responseArray[0]);
            var query = responseArray[1];

            expect(ast.queryType, 'topic [ast.queryType]').to.equal('update');
            expect(ast.schema, 'topic [ast.schema]').to.equal(ACCOUNTID);
            expect(ast.table, 'topic [ast.table]').to.equal('mytable');
            expect(ast.adminOp, 'topic [ast.adminOp]').to.equal(false);
            expect(ast.bucketOp, 'topic [ast.bucketOp]').to.equal(false);
            expect(ast.user, 'topic [ast.user]').to.equal(ACCOUNTID);
            expect(ast.password, 'topic [ast.password]').to.equal(PASSWORD);

            expect(query).to.equal('update accountid.mytable set col2=33;');
        })
        .done(done, function (errObject) {console.log('ERROR',  errObject.message);});

    });

});
