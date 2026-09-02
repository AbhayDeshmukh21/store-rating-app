// seed.js
// Inserts a small amount of demo data so the app can be tested right away.
// Usage: node database/seed.js
// Safe to run multiple times - it clears old data first.

const bcrypt = require("bcrypt");
const pool = require("../db");

async function seed() {
  try {
    // Clear existing data (ratings first because they reference users/stores)
    await pool.query("DELETE FROM ratings");
    await pool.query("DELETE FROM stores");
    await pool.query("DELETE FROM users");

    // Restart the auto-increment ids so demo ids are predictable
    await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE stores_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE ratings_id_seq RESTART WITH 1");

    const hash = (plain) => bcrypt.hash(plain, 10);

    // ---- Admin ----
    const adminPassword = await hash("Admin@123");
    const adminResult = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, 'ADMIN') RETURNING id`,
      ["System Administrator Account", "admin@example.com", adminPassword, "Head Office, Nagpur, Maharashtra"]
    );

    // ---- Store Owners ----
    const owner1Password = await hash("Owner@123");
    const owner1 = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, 'STORE_OWNER') RETURNING id`,
      ["Rajesh Kumar Store Owner Account", "owner@example.com", owner1Password, "MG Road, Nagpur, Maharashtra"]
    );

    const owner2Password = await hash("Owner@456");
    const owner2 = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, 'STORE_OWNER') RETURNING id`,
      ["Sunita Verma Second Store Owner", "owner2@example.com", owner2Password, "Civil Lines, Nagpur, Maharashtra"]
    );

    // ---- Normal Users ----
    const userNames = [
      ["Rahul Sharma From Nagpur City", "rahul@example.com"],
      ["Priya Patel Normal User Account", "priya@example.com"],
      ["Amit Kumar Regular Platform User", "amit@example.com"],
    ];
    const userPassword = await hash("User@123");
    const userIds = [];
    for (const [name, email] of userNames) {
      const result = await pool.query(
        `INSERT INTO users (name, email, password, address, role)
         VALUES ($1, $2, $3, $4, 'USER') RETURNING id`,
        [name, email, userPassword, "Residential Area, Nagpur, Maharashtra"]
      );
      userIds.push(result.rows[0].id);
    }

    // ---- Stores ----
    const store1 = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ["ABC Grocery Store", "abcstore@example.com", "Sitabuldi, Nagpur, Maharashtra", owner1.rows[0].id]
    );
    const store2 = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ["Fresh Mart Supermarket", "freshmart@example.com", "Dharampeth, Nagpur, Maharashtra", owner2.rows[0].id]
    );
    const store3 = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ["City Book House", "citybooks@example.com", "Sadar, Nagpur, Maharashtra", null]
    );

    // ---- Sample Ratings ----
    const s1 = store1.rows[0].id;
    const s2 = store2.rows[0].id;
    const s3 = store3.rows[0].id;
    const [u1, u2, u3] = userIds;

    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES
        ($1, $2, 5),
        ($3, $2, 4),
        ($4, $2, 3),
        ($1, $5, 4),
        ($3, $6, 5)`,
      [u1, s1, u2, u3, s2, s3]
    );

    console.log("Seed data inserted successfully.");
    console.log("---------------------------------");
    console.log("Admin login:       admin@example.com / Admin@123");
    console.log("Store Owner login: owner@example.com / Owner@123");
    console.log("Normal user login: rahul@example.com / User@123");
    console.log("---------------------------------");
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
