// db.js
// Sets up a single reusable connection pool to PostgreSQL.
// All route files import this "pool" object to run SQL queries.

require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
