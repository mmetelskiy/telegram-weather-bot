const mysql = require('mysql');

const SqlQuery = function () {
  this._sqlString = '';
};

SqlQuery.format = function (template, params) {
  return mysql.format(template, params);
};

SqlQuery.prototype._format = function (template, params) {
  const queryPart = SqlQuery.format(template, params);

  this._sqlString += ` ${queryPart}`;
};

SqlQuery.prototype.select = function (fields) {
  fields = fields || '*';

  if (typeof fields !== 'string' && !Array.isArray(fields)) {
    throw new Error('Unexpected fields to SELECT. Use string, array or pass nothing');
  }

  this._format('SELECT ??', [fields]);

  return this;
};

SqlQuery.prototype.from = function (tableName) {
  if (!tableName || typeof tableName !== 'string') {
    throw new Error(`Unexpected table name: '${tableName}'`);
  }

  this._format('FROM ??', tableName);

  return this;
};

SqlQuery.prototype.joinOn = function (tableName, firstKey, secondKey) {
  this._format('JOIN ?? ON ?? = ??', [tableName, firstKey, secondKey]);

  return this;
};

SqlQuery.prototype.where = function (objectEquals, objectLike) {
  const paramsArray = [];

  let template = Object.keys(objectEquals || {})
    .map((key) => {
      paramsArray.push(key, objectEquals[key]);

      return '?? = ?';
    })
    .concat(Object.keys(objectLike || {})
      .map((key) => {
        paramsArray.push(key, objectLike[key]);

        return '?? LIKE ?';
      })
    )
    .join(' AND ');

  if (template === '') {
    throw new Error('No arguments provided');
  }

  template = `WHERE ${template}`;

  this._format(template, paramsArray);

  return this;
};

SqlQuery.prototype.insertInto = function (tableName, object) {
  if (!tableName || typeof tableName !== 'string') {
    throw new Error(`Unexpected table name: '${tableName}'`);
  }

  if (typeof object !== 'object') {
    throw new Error('Unexpected parameter to INSERT. Use object');
  }

  const template = 'INSERT INTO ?? (??) VALUES (?)';
  const fields = Object.keys(object);
  const values = fields.map((key) => {
    return object[key];
  });

  this._format(template, [tableName, fields, values]);

  return this;
};

SqlQuery.prototype.update = function (tableName) {
  if (!tableName || typeof tableName !== 'string') {
    throw new Error(`Unexpected table name: '${tableName}'`);
  }

  const template = 'UPDATE ??';

  this._format(template, tableName);
  return this;
};

SqlQuery.prototype.set = function (object) {
  if (typeof object !== 'object') {
    throw new Error('Unexpected parameter to INSERT. Use object');
  }

  const template = 'SET ?';

  this._format(template, object);
  return this;
};

SqlQuery.prototype.deleteFrom = function (tableName) {
  if (!tableName || typeof tableName !== 'string') {
    throw new Error(`Unexpected table name: '${tableName}'`);
  }

  const template = 'DELETE FROM ??';

  this._format(template, tableName);
  return this;
};

SqlQuery.prototype.toString = function () {
  const result = this._sqlString;

  this._sqlString = '';
  return result.trim();
};

SqlQuery.prototype.selectMax = function (columnName) {
  if (!columnName || typeof columnName !== 'string') {
    throw new Error(`Unexpected column name: '${columnName}'`);
  }

  const template = 'SELECT MAX(??)';

  this._format(template, columnName);
  return this;
};

SqlQuery.prototype.as = function (alias) {
  if (!alias || typeof alias !== 'string') {
    throw new Error(`Unexpected alias: '${alias}'`);
  }

  const template = 'AS ??';

  this._format(template, alias);
  return this;
};

module.exports = SqlQuery;
