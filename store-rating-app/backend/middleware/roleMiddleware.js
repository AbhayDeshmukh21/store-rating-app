// roleMiddleware.js
// Restricts a route to one or more roles. Must be used AFTER authMiddleware,
// since it relies on req.user being already set.
//
// Usage: router.get("/admin/users", authMiddleware, requireRole("ADMIN"), handler)

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You are not authorized to perform this action." });
    }
    next();
  };
}

module.exports = requireRole;
