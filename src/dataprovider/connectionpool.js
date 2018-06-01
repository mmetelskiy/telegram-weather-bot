const mysql = require('mysql');
const async = require('async');
const WError = require('verror').WError;

const dbConfig = require('../config').db;

const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  port: dbConfig.port,
  database: dbConfig.database,
  supportBigNumbers: true // `settings`.`chat_id` is BIGINT
});

exports.getConnection = pool.getConnection.bind(pool);

exports.query = function (query, params, callback) {
  pool.query(query, params, (error, data) => {
    callback(error, data);
  });
};

exports.performTransaction = function (functions, callback) {
  this.getConnection(function processConnection(connectionError, connection) {
    if (connectionError) {
      callback(new WError(connectionError, 'Failed to get connection.'));
      return;
    }

    connection.beginTransaction(function performTransaction(transactionError) {
      if (transactionError) {
        connection.release();
        callback(new WError(transactionError, 'Failed to begin transaction.'));
        return;
      }

      functions = functions.map((func) => {
        return func.bind(null, connection);
      });

      async.series(functions, function processTransactionResults(error, results) {
        if (error) {
          connection.rollback(function processRollback() { // eslint-disable-line max-nested-callbacks
            connection.release();
            callback(error);
          });
        } else {
          connection.commit(function processCommit(commitError) { // eslint-disable-line max-nested-callbacks
            if (commitError) {
              connection.rollback(function processRollback() { // eslint-disable-line max-nested-callbacks
                connection.release();
                callback(new WError(commitError, 'Failed to commit transaction.'));
              });
            } else {
              connection.release();
              callback(null, results); // eslint-disable-line callback-return
            }
          });
        }
      });
    });
  });
};
