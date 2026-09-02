// authMiddleware.js
// Verifies the JWT sent by the frontend and attaches the decoded user info
// (id, role) to req.user so later route handlers can use it.

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "You are not authorized to perform this action." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "You are not authorized to perform this action." });
  }
}

module.exports = authMiddleware;
