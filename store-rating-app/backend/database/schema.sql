-- schema.sql
-- Creates the three tables used by the Store Rating Application.
-- Run this once before starting the server (see README for instructions).

-- Users table: stores admins, normal users and store owners in one table,
-- distinguished by the "role" column.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- stores a bcrypt hash, never plain text
  address VARCHAR(400) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER', 'STORE_OWNER')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Stores table: each store optionally has an owner (a user with role STORE_OWNER).
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address VARCHAR(400) NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ratings table: one row per (user, store) pair. The UNIQUE constraint
-- guarantees a user cannot rate the same store more than once.
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, store_id)
);
