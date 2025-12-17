const knex = require('knex');
const knexConfig = require('../db/knexfile');
const env = require('./env');

// Create a single shared Knex instance for the whole app
const db = knex(knexConfig[env.nodeEnv] || knexConfig.development);

// Simple health check helper for startup
async function verifyConnection() {
  await db.raw('SELECT 1');
}

module.exports = {
  db,
  verifyConnection,
};


