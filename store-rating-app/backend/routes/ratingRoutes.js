// ratingRoutes.js
// Normal User: submit a new rating, update their existing rating.
// Admin dashboard statistics also live here since they involve ratings count.

const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const { isValidRating } = require("../validators");

const router = express.Router();

// POST /api/ratings
// Normal User only. Creates a new rating for a store.
// If the user already rated this store, returns an error asking them to
// use the update endpoint instead (PUT /api/ratings/:id).
router.post("/", authMiddleware, requireRole("USER"), async (req, res) => {
  try {
    const { storeId, rating } = req.body;

    if (!isValidRating(rating)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const storeCheck = await pool.query("SELECT id FROM stores WHERE id = $1", [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ message: "Store not found." });
    }

    const existing = await pool.query(
      "SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2",
      [req.user.id, storeId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "You have already rated this store. Please modify your existing rating instead." });
    }

    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)
       RETURNING id, user_id, store_id, rating`,
      [req.user.id, storeId, rating]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// PUT /api/ratings/:id
// Normal User only. Updates their own existing rating (identified by rating id).
router.put("/:id", authMiddleware, requireRole("USER"), async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!isValidRating(rating)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const existing = await pool.query("SELECT * FROM ratings WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Rating not found." });
    }
    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to perform this action." });
    }

    const result = await pool.query(
      `UPDATE ratings SET rating = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, user_id, store_id, rating`,
      [rating, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// A separate GET /api/stores/:id/ratings endpoint is not needed here -
// the store owner dashboard (in storeRoutes.js) already returns the list of
// users who rated a store, and the admin/user store listings already
// include the overall rating. This keeps the API surface minimal.

module.exports = router;
