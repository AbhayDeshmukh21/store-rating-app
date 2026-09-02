// storeRoutes.js
// Admin: create a store, view all stores (with filter/sort).
// Normal User: view all stores with their own rating, search by name/address.
// Store Owner: view their own dashboard (average rating + list of raters).

const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const { isValidName, isValidAddress, isValidEmail } = require("../validators");

const router = express.Router();

const ALLOWED_SORT_FIELDS = ["name", "email", "address", "rating"];

// POST /api/stores
// Admin only. Creates a new store, optionally linked to a Store Owner.
router.post("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || name.length === 0) {
      return res.status(400).json({ message: "Store name is required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }
    if (!isValidAddress(address)) {
      return res.status(400).json({ message: "Address must be at most 400 characters." });
    }

    if (ownerId) {
      const ownerCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'STORE_OWNER'",
        [ownerId]
      );
      if (ownerCheck.rows.length === 0) {
        return res.status(400).json({ message: "Selected store owner does not exist." });
      }
    }

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, owner_id`,
      [name, email, address, ownerId || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// GET /api/stores
// Works for both Admin and Normal User (auth required either way).
// - Admin sees: name, email, address, overall rating.
// - Normal User additionally sees their own submitted rating for each store,
//   and can search by name/address via query params.
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { name, address, sortBy, order } = req.query;

    const conditions = [];
    const values = [];

    if (name) {
      values.push(`%${name}%`);
      conditions.push(`s.name ILIKE $${values.length}`);
    }
    if (address) {
      values.push(`%${address}%`);
      conditions.push(`s.address ILIKE $${values.length}`);
    }

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id,
        ROUND(AVG(r.rating)::numeric, 1) AS overall_rating
    `;

    // Only include "my rating" when the requester is a Normal User
    if (req.user.role === "USER") {
      values.push(req.user.id);
      query += `, (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $${values.length}) AS my_rating`;
      query += `, (SELECT id FROM ratings WHERE store_id = s.id AND user_id = $${values.length}) AS rating_id`;
    }

    query += ` FROM stores s LEFT JOIN ratings r ON r.store_id = s.id`;

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += ` GROUP BY s.id`;

    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "name";
    const sortColumn = sortField === "rating" ? "overall_rating" : `s.${sortField}`;
    const sortOrder = order === "desc" ? "DESC" : "ASC";
    query += ` ORDER BY ${sortColumn} ${sortOrder} NULLS LAST`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// GET /api/stores/owner/dashboard
// Store Owner only. Returns their store info, average rating, and the list
// of users who rated it. IMPORTANT: this route is defined BEFORE
// GET /api/stores/:id so Express does not treat "owner" as an :id value.
router.get("/owner/dashboard", authMiddleware, requireRole("STORE_OWNER"), async (req, res) => {
  try {
    const storeResult = await pool.query("SELECT * FROM stores WHERE owner_id = $1", [req.user.id]);
    const store = storeResult.rows[0];

    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    const ratingsResult = await pool.query(
      `SELECT u.name AS user_name, r.rating
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    const avgResult = await pool.query(
      "SELECT ROUND(AVG(rating)::numeric, 1) AS average_rating FROM ratings WHERE store_id = $1",
      [store.id]
    );

    res.json({
      store: { id: store.id, name: store.name, email: store.email, address: store.address },
      averageRating: avgResult.rows[0].average_rating, // null if no ratings yet
      raters: ratingsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// GET /api/stores/:id
// Admin or User. Returns a single store's info with its overall rating.
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id,
        ROUND(AVG(r.rating)::numeric, 1) AS overall_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Store not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;
