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
  db.createTable('user_profiles', {
    id: 
    { 
      type: 'int',
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true 
    },
    user_id: 
    {
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'user_profiles_user_id_fk',
        table: 'users',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }
    },
    language: 'string',
    topic: 'string',
    difficulty: 'string',
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
  db.dropTable('user_profiles', callback);
};

exports._meta = {
  'version': 1
};
