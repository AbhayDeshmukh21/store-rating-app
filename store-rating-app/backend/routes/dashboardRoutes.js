// dashboardRoutes.js
// Admin only. Returns the three headline numbers shown on the admin dashboard.

const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    const storesCount = await pool.query("SELECT COUNT(*) FROM stores");
    const ratingsCount = await pool.query("SELECT COUNT(*) FROM ratings");

    res.json({
      totalUsers: Number(usersCount.rows[0].count),
      totalStores: Number(storesCount.rows[0].count),
      totalRatings: Number(ratingsCount.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;
