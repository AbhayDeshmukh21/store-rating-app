// validators.js
// Small helper functions used by the route files to validate incoming data.
// Kept simple on purpose - just plain functions, no external validation library.

function isValidName(name) {
  return typeof name === "string" && name.length >= 20 && name.length <= 60;
}

function isValidAddress(address) {
  return typeof address === "string" && address.length > 0 && address.length <= 400;
}

function isValidEmail(email) {
  // Standard, simple email pattern - good enough for this assessment
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === "string" && emailPattern.test(email);
}

function isValidPassword(password) {
  if (typeof password !== "string") return false;
  if (password.length < 8 || password.length > 16) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password);
  return hasUppercase && hasSpecialChar;
}

function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

module.exports = {
  isValidName,
  isValidAddress,
  isValidEmail,
  isValidPassword,
  isValidRating,
};
