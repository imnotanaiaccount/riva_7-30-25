// Update the following line to use ES module imports
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/riva_dev',
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    },
    pool: {
      min: 2,
      max: 10
    },
    debug: process.env.NODE_ENV === 'development'
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    pool: {
      min: 2,
      max: 10
    },
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
};
