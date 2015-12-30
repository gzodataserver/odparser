// Imports
// =======

var u = require('underscore');

// Setup logging
// =============

var log = console.log.bind(console);
var debug = console.log.bind(console, 'DEBUG');
var info = console.info.bind(console);
var error = console.error.bind(console);

// ODataUri2Sql class
// ===================

//
// Translate OData filter to a SQL where expression
// ------------------------------------------------
//
// These OData filters are supported, see
// http://www.odata.org/documentation/odata-version-2-0/uri-conventions
// for more information.
//
// |Operator    |Description     |Example
// |------------|----------------|------------------------------------------------|
// |Logical Operators|           |                                                |
// |Eq          |Equal           |/Suppliers?$filter=Address/City eq ‘Redmond’    |
// |Ne          |Not equal       |/Suppliers?$filter=Address/City ne ‘London’     |
// |Gt          |Greater than    |/Products?$filter=Price gt 20                   |
// |Ge          |Greater than or equal|/Products?$filter=Price ge 10              |
// |Lt          |Less than       |/Products?$filter=Price lt 20                   |
// |Le          |Less than or equal|/Products?$filter=Price le 100                |
// |And         |Logical and     |/Products?$filter=Price le 200 and Price gt 3.5 |
// |Or          |Logical or      |/Products?$filter=Price le 3.5 or Price gt 200  |
// |Not         |Logical negation|/Products?$filter=not endswith(Description,’milk’)|
// |Arithmetic Operators|        |                                               |
// |Add         |Addition        |/Products?$filter=Price add 5 gt 10            |
// |Sub         |Subtraction     |/Products?$filter=Price sub 5 gt 10            |
// |Mul         |Multiplication  |/Products?$filter=Price mul 2 gt 2000          |
// |Div         |Division        |/Products?$filter=Price div 2 gt 4             |
// |Mod         |Modulo          |/Products?$filter=Price mod 2 eq 0             |
// |Grouping Operators|          |                                               |
// |( )         |Precedence grouping|/Products?$filter=(Price sub 5) gt 10        |
//
//
// A BNF for SQL where clauses (just for reference), see
// http://dev.mysql.com/doc/refman/5.7/en/expressions.html for more information.
//
//     expr:
//        expr OR expr
//      | expr || expr
//      | expr XOR expr
//      | expr AND expr
//      | expr && expr
//      | NOT expr
//      | ! expr
//      | boolean_primary IS [NOT] {TRUE | FALSE | UNKNOWN}
//      | boolean_primary
//
//     boolean_primary:
//       boolean_primary IS [NOT] NULL
//      | boolean_primary <=> predicate
//      | boolean_primary comparison_operator predicate
//      | boolean_primary comparison_operator {ALL | ANY} (subquery)
//      | predicate
//
//     comparison_operator: = | >= | > | <= | < | <> | !=

// Translate Odata filter operators to sql operators.
// Strings not matched are just returned as is
var translateOp = function(s) {

  // translation from OData filter to SQL where clause for the supported operators
  var op = [];
  op['eq'] = '=';
  op['ne'] = '<>';
  op['gt'] = '>';
  op['ge'] = '>=';
  op['lt'] = '<';
  op['le'] = '<=';
  op['and'] = 'and';
  op['or'] = 'or';
  op['not'] = 'not';
  op['add'] = '+';
  op['sub'] = '-';
  op['mul'] = '*';
  op['div'] = '/';
  op['mod'] = 'mod';

  return (op[s.toLowerCase()] !== undefined) ? op[s.toLowerCase()] : s;
};

// take a string with a filter expresssion and translate into a SQL expression
var filter2where = function(expr) {

  // check for functions and groupings. These are not supported.
  if (expr.indexOf('(') > -1) {
    throw new Error('Functions and groupings are not supported: ' + expr);
  }

  // remove multiple spaces
  expr = expr.replace(/\s{2,}/g, ' ');

  // create array of tokens
  expr = expr.split(' ');

  // translate operators and create a string
  return u.map(expr, translateOp).join(' ');
};

// Build the SQL statement
// ------------------------
//
// Supported OData Query strings:
//
// * `$orderby=col[ asc|desc]` - SQL: `order by`
// * `$filter=...` - SQL: `where` clause
// * `$skip=N` - `$orderby` must supplied for the result to be reliable
// * `$select=col,col` - columns in the `select`
//
// Not supported:
//
// * `$top`
// * `$inlinecount`
// * `$expand`
// * `$format` - only json is supported
//
//
// **SQL BNF (for reference)**
//
// See http://dev.mysql.com/doc/refman/5.7/en/select.html for more details
//
//     1.SELECT
//         [ALL | DISTINCT | DISTINCTROW ]
//           [HIGH_PRIORITY]
//           [MAX_STATEMENT_TIME]
//           [STRAIGHT_JOIN]
//           [SQL_SMALL_RESULT] [SQL_BIG_RESULT] [SQL_BUFFER_RESULT]
//           [SQL_CACHE | SQL_NO_CACHE] [SQL_CALC_FOUND_ROWS]
//         select_expr [, select_expr ...]
//     2.  [FROM table_references
//           [PARTITION partition_list]
//     3.  [WHERE where_condition]
//     4.  [GROUP BY {col_name | expr | position}
//           [ASC | DESC], ... [WITH ROLLUP]]
//     5.  [HAVING where_condition]
//     6.  [ORDER BY {col_name | expr | position}
//           [ASC | DESC], ...]
//     7.  [LIMIT {[offset,] row_count | row_count OFFSET offset}]
//     8.  [PROCEDURE procedure_name(argument_list)]
//     9.  [INTO OUTFILE 'file_name'
//           [CHARACTER SET charset_name]
//           export_options
//           | INTO DUMPFILE 'file_name'
//           | INTO var_name [, var_name]]
//         [FOR UPDATE | LOCK IN SHARE MODE]]
//

var odata2sql = function(param, key) {
  // Default number of rows to return
  var defaultRowCount = global.CONFIG.ODATA.DEFAULT_ROW_COUNT;

  // `id` is used to sort the statements in the right order
  switch (key) {
    case '$orderby':
      return {
        id: 6,
        q: ' order by ' + param
      };

    case '$filter':
      return {
        id: 3,
        q: ' where ' + filter2where(param)
      };

    case '$skip':
      return {
        id: 7,
        q: ' limit ' + param + ',' + defaultRowCount
      };

    case '$select':
      return {
        id: 1,
        q: 'select ' + param
      };

    case '$top':
      throw Error('Unsupported query: ' + key);

    case '$inlinecount':
      throw Error('Unsupported query: ' + key);

    case '$expand':
      throw Error('Unsupported query: ' + key);

    case '$format':
      throw Error('Only JSON is supported!');

    default:
      throw Error('Invalid query: ' + key);
  }
};

//
// Take the json object created by `odata2sql`, sort them in the correct order
// create a string with the SQL
var reduce = function(sqlObjects) {
  // create a string from the objects
  return u.reduce(
    sqlObjects,
    function(memo, o) {
      return memo + o.q;
    },
    "");

};

//
// parse the URI using a simple BNF grammar
// ------------------------------------
//
// This BNF describes the operations that the OData server support.
//
// ```
// slash ('/'') is the delimiter for tokens
//
// URI like: /help
// <method,uri>        ::= basic_uri
//                     |   system_uri
//                     |   table_uri
//                     |   metadata_uri
//
// <method,basic_uri>  ::= <GET,'help'>
//                     |  <POST,'create_account'>
//                     |  <POST,'delete_account'>
//
// URI like /account/s/system_operation
// <method,system_uri> ::= <GET,variable 's' reset_password variable> -> [reset_password,account,resetToken]
//                     |   <POST,variable 's' system_operation> -> [system_operation,account]
// system_operation    ::= 'create_table'
//                     |   'create_bucket'
//                     |   'delete_table'
//                     |   'drop_bucket'
//                     |   'grant'
//                     |   'revoke'
//                     |   'reset_password'
//
// URI like /account/table/$metadata
// <method, metadata_uri> ::= <GET, variable variable '$metdata'>
//
// URI like /account/table
// <method,table_uri>  ::= <GET,variable>             -> [service_def,account]
//                     |   <GET,variable variable>    -> [select,account,table]
//                     |   <POST,variable variable>   -> [insert,account,table]
//                     |   <PUT,variable variable>    -> [update,account,table]
//                     |   <DELETE,variable variable> -> [delete,account,table]
//
// variable            ::= SQL schema or table name
// ```

var parseUri = function(method, tokens) {
  var res = parseBasicUri(method, tokens) || parseSystemUri(method, tokens) ||
    parseMetadataUri(method, tokens) || parseTableUri(method, tokens);

  debug('parseUri: ' + JSON.stringify(res));

  // indexing with `table(x)` is not supported
  if (res.table !== undefined && res.table.indexOf('(') > -1) {
    throw new Error('The form /schema/entity(key) is not supported.' +
      ' Use $filter instead.');
  }

  return res;
};

// URI:s like `/help` and `/create_account`
var parseBasicUri = function(method, tokens) {
  debug('parseBasicUri method: ' + method + ' tokens: ' + tokens);

  if (method === 'GET' && tokens[0] === 'help' &&
    tokens.length === 1) {
    return {
      queryType: 'help'
    };
  }

  if (method === 'POST' && tokens[0] === 'create_account' &&
    tokens.length === 1) {
    return {
      queryType: 'create_account'
    };
  }

  return false;
};

// URI:s like `/account/s/create_table`
var parseSystemUri = function(method, tokens) {
  if (method === 'POST' &&
    tokens.length === 3 &&
    tokens[1] === global.CONFIG.ODATA.SYS_PATH && ['reset_password',
      'delete_account', 'create_bucket',
      'drop_bucket', 'create_table', 'grant', 'revoke', 'delete_table'
    ].indexOf(tokens[2]) !== -1) {
    return {
      queryType: tokens[2],
      schema: tokens[0]
    };
  }

  if (method === 'GET' &&
    tokens.length === 4 &&
    tokens[1] === global.CONFIG.ODATA.SYS_PATH &&
    tokens[2] === 'reset_password') {
    return {
      queryType: tokens[2],
      schema: tokens[0],
      resetToken: tokens[3]
    };
  }

  return false;
};

// URI:s like `/account/table/$metdata`
var parseMetadataUri = function(method, tokens) {
  if (method === 'GET' &&
    tokens.length === 3 &&
    tokens[2] === '$metadata') {
    return {
      queryType: 'metadata',
      schema: tokens[0],
      table: tokens[1]
    };
  }

  return false;
};

// URI:s like `/account` or `/account/table`, `tokens = [account,table]`
var parseTableUri = function(method, tokens) {
  if (method === 'GET' && tokens.length === 1) {
    return {
      queryType: 'service_def',
      schema: tokens[0]
    };
  }

  if (method === 'GET' && tokens.length === 2) {
    return {
      queryType: 'select',
      schema: tokens[0],
      table: tokens[1]
    };
  }

  if (method === 'POST' && tokens.length === 2) {
    return {
      queryType: 'insert',
      schema: tokens[0],
      table: tokens[1]
    };
  }

  if (method === 'PUT' && tokens.length === 2) {
    return {
      queryType: 'update',
      schema: tokens[0],
      table: tokens[1]
    };
  }

  if (method === 'DELETE' && tokens.length === 2) {
    return {
      queryType: 'delete',
      schema: tokens[0],
      table: tokens[1]
    };
  }

  return false;

};

// Just an empty constructor
ODataUri2Sql = function() {
  var self = this;
};

ODataUri2Sql.prototype.parseUri2 = function(method, inputUri) {
  var url = require('url');
  var parsedUri_ = url.parse(inputUri, true, false);

  // get the schema and table name
  var a_ = parsedUri_.pathname.split("/");

  // drop the first element which is an empty string
  var tokens_ = a_.splice(1, a_.length);

  var result = parseUri(method, tokens_);

  // translate odata queries in URI to sql
  var sqlObjects = u.map(parsedUri_.query, odata2sql);

  // Build the select statement
  if (result.queryType === 'select') {

    sqlObjects.push({
      id: 2,
      q: ' from ' + result.schema + '.' + result.table
    });

    // sort the query objects according to the sql specification
    sqlObjects = u.sortBy(sqlObjects, function(o) {
      return o.id;
    });

    // add `select *` if there is no `$select`
    if (sqlObjects[0].id != 1) {
      sqlObjects.push({
        id: 1,
        q: 'select *'
      });
    }
  }

  // Check that there is no `where` statement in `insert`
  if (result.queryType === 'insert') {

    // check that there are no parameters
    if (!u.isEmpty(parsedUri_.query)) {
      throw new Error('Parameters are not supported in POST: ' +
        JSON.stringify(parsedURL.query));
    }

  }

  // sort the query objects according to the sql specification
  sqlObjects = u.sortBy(sqlObjects, function(o) {
    return o.id;
  });

  // create a string from the objects
  var sql = u.reduce(
    sqlObjects,
    function(memo, o) {
      return memo + o.q;
    },
    "");

  if (sql !== '') {
    result.sql = sql;
  }

  return result;

};

// exports
// ========

module.exports = ODataUri2Sql;
