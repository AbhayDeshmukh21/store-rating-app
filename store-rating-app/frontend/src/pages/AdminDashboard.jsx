// AdminDashboard.jsx
import { useEffect, useState } from "react";
import apiRequest from "../api/api";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/dashboard/stats", { token })
      .then(setStats)
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      {error && <p className="error-text">{error}</p>}

      {stats && (
        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-number">{stats.totalUsers}</p>
            <p className="stat-label">Total Users</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.totalStores}</p>
            <p className="stat-label">Total Stores</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.totalRatings}</p>
            <p className="stat-label">Total Ratings</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
