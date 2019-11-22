'use strict';

// Sources:
// https://db-migrate.readthedocs.io/en/latest/API/SQL/
// https://db-migrate.readthedocs.io/en/latest/Getting%20Started/commands/#reset
var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  db.createTable('users', {
    id: 
    { 
      type: 'int',
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true 
    },
    email: 
    {
      type: 'string',
      notNull: true,
      unique: true
    },
    username:
    {
      type: 'string',
      notNull: true
    },
    password_hash: 
    {
      type: 'string',
      notNull: true
    },
    created_at: 
    {
      type: 'timestamp',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP')
    }, 
    updated_at: 
    {
      type: 'timestamp',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP')
    }
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('users', callback);
};

exports._meta = {
  'version': 1
};
