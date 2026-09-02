// migrate.js
// Reads schema.sql and runs it against the configured database.
// Usage: node database/migrate.js

const fs = require("fs");
const path = require("path");
const pool = require("../db");

async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  try {
    await pool.query(sql);
    console.log("Database schema created successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
