// Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../api/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      login(data.token, data.user);

      // Redirect based on role
      if (data.user.role === "ADMIN") navigate("/admin/dashboard");
      else if (data.user.role === "STORE_OWNER") navigate("/owner/dashboard");
      else navigate("/stores");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-centered">
      <form className="card form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="error-text">{error}</p>}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
