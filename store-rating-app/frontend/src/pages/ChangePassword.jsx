// ChangePassword.jsx
import { useState } from "react";
import apiRequest from "../api/api";
import { useAuth } from "../context/AuthContext";

function ChangePassword() {
  const { token } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmNewPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      const data = await apiRequest("/users/password", {
        method: "PUT",
        token,
        body: form,
      });
      setSuccess(data.message);
      setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-centered">
      <form className="card form" onSubmit={handleSubmit}>
        <h2>Update Password</h2>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <label>Current Password</label>
        <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} required />

        <label>New Password (8-16 chars, 1 uppercase, 1 special char)</label>
        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} required />

        <label>Confirm New Password</label>
        <input type="password" name="confirmNewPassword" value={form.confirmNewPassword} onChange={handleChange} required />

        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}

export default ChangePassword;
