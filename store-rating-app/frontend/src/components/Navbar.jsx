// Navbar.jsx
// Shows different links depending on the logged-in user's role.

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user) {
    return null; // No navbar on the login/signup pages
  }

  return (
    <nav className="navbar">
      <span className="navbar-title">Store Rating App</span>
      <div className="navbar-links">
        {user.role === "ADMIN" && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/stores">Stores</Link>
          </>
        )}
        {user.role === "USER" && (
          <>
            <Link to="/stores">Stores</Link>
            <Link to="/change-password">Change Password</Link>
          </>
        )}
        {user.role === "STORE_OWNER" && (
          <>
            <Link to="/owner/dashboard">Dashboard</Link>
            <Link to="/change-password">Change Password</Link>
          </>
        )}
        <span className="navbar-user">Hi, {user.name.split(" ")[0]}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
