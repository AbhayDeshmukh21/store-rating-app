// userRoutes.js
// Admin: create users (normal/admin), list users with filter+sort, view user details.
// Any logged-in user: change their own password.

const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const { isValidName, isValidAddress, isValidEmail, isValidPassword } = require("../validators");

const router = express.Router();

// Fields that are safe to sort by, to avoid SQL injection via ?sortBy=
const ALLOWED_SORT_FIELDS = ["name", "email", "address", "role"];

// GET /api/users
// Admin only. Supports optional filters (name, email, address, role) and sorting.
router.get("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, email, address, role, sortBy, order } = req.query;

    const conditions = [];
    const values = [];

    if (name) {
      values.push(`%${name}%`);
      conditions.push(`name ILIKE $${values.length}`);
    }
    if (email) {
      values.push(`%${email}%`);
      conditions.push(`email ILIKE $${values.length}`);
    }
    if (address) {
      values.push(`%${address}%`);
      conditions.push(`address ILIKE $${values.length}`);
    }
    if (role) {
      values.push(role);
      conditions.push(`role = $${values.length}`);
    }

    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role,
        (SELECT ROUND(AVG(r.rating)::numeric, 1) FROM ratings r
          JOIN stores s ON s.id = r.store_id WHERE s.owner_id = u.id) AS store_rating
      FROM users u
    `;

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "name";
    const sortOrder = order === "desc" ? "DESC" : "ASC";
    query += ` ORDER BY u.${sortField} ${sortOrder}`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// GET /api/users/:id
// Admin only. Returns one user's details. If the user is a Store Owner,
// also includes their store's average rating.
router.get("/:id", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, name, email, address, role FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = result.rows[0];

    if (user.role === "STORE_OWNER") {
      const ratingResult = await pool.query(
        `SELECT ROUND(AVG(r.rating)::numeric, 1) AS average_rating
         FROM ratings r
         JOIN stores s ON s.id = r.store_id
         WHERE s.owner_id = $1`,
        [id]
      );
      user.storeRating = ratingResult.rows[0].average_rating; // null if no ratings yet
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// POST /api/users
// Admin only. Creates a Normal User or an Admin user.
router.post("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Role must be USER or ADMIN." });
    }
    if (!isValidName(name)) {
      return res.status(400).json({ message: "Name must be between 20 and 60 characters." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }
    if (!isValidAddress(address)) {
      return res.status(400).json({ message: "Address must be at most 400 characters." });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters and contain at least one uppercase letter and one special character.",
      });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role`,
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// PUT /api/users/password
// Any authenticated user can change their own password.
router.put("/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New password and confirmation do not match." });
    }
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters and contain at least one uppercase letter and one special character.",
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [newHashedPassword, req.user.id]);

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;
