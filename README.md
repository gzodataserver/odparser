Parse URL:s in OData format into an AST (Abstract Syntax Tree)
=============================================================

Install dependencies with: `npm install`

Development
-----------

Test like this:

````
node test_json2sql.js

node test_server.js
node test_odparser.js

# the tests for stored procedures are using mocha (the rest will be migrated when there is time)
mocha
```
