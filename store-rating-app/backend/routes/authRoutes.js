// authRoutes.js
// Handles signup (for Normal Users only) and login (for all roles).

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { isValidName, isValidAddress, isValidEmail, isValidPassword } = require("../validators");

const router = express.Router();

// POST /api/auth/register
// Public signup - always creates a user with role USER.
// Admins and Store Owners are created separately by an Admin (see userRoutes.js).
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

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
       VALUES ($1, $2, $3, $4, 'USER') RETURNING id, name, email, address, role`,
      [name, email, hashedPassword, address]
    );

    res.status(201).json({ message: "Account created successfully.", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// POST /api/auth/login
// Single login endpoint for Admin, User and Store Owner.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    // Never send the password hash back to the client
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;
