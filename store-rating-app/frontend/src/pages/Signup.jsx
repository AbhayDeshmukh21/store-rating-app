// Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../api/api";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", address: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Frontend validation mirrors the backend rules, so the user gets instant
  // feedback before the request is even sent.
  function validate() {
    if (form.name.length < 20 || form.name.length > 60) {
      return "Name must be between 20 and 60 characters.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Invalid email address.";
    }
    if (form.address.length === 0 || form.address.length > 400) {
      return "Address must be at most 400 characters.";
    }
    const hasUppercase = /[A-Z]/.test(form.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(form.password);
    if (form.password.length < 8 || form.password.length > 16 || !hasUppercase || !hasSpecialChar) {
      return "Password must contain at least one uppercase letter and one special character.";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await apiRequest("/auth/register", { method: "POST", body: form });
      setSuccess("Account created successfully. You can now log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-centered">
      <form className="card form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <label>Name (20-60 characters)</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Address (max 400 characters)</label>
        <textarea name="address" value={form.address} onChange={handleChange} required />

        <label>Password (8-16 chars, 1 uppercase, 1 special char)</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />

        <button type="submit">Sign Up</button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
