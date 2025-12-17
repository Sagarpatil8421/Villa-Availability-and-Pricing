const path = require('path');
const dotenv = require('dotenv');

// When knex CLI runs, it changes CWD to src/db, so we must
// explicitly point dotenv to the project root .env file.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME, // e.g. villa_db
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};