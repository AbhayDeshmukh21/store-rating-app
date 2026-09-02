// OwnerDashboard.jsx
import { useEffect, useState } from "react";
import apiRequest from "../api/api";
import { useAuth } from "../context/AuthContext";

function OwnerDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/stores/owner/dashboard", { token })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div className="page">
      <h2>My Store</h2>
      {error && <p className="error-text">{error}</p>}

      {data && (
        <>
          <div className="card">
            <p><strong>Store Name:</strong> {data.store.name}</p>
            <p><strong>Average Rating:</strong> {data.averageRating ?? "No ratings yet"}</p>
          </div>

          <h3>Users Who Rated This Store</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.raters.length === 0 && (
                <tr>
                  <td colSpan={2}>No ratings yet.</td>
                </tr>
              )}
              {data.raters.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.user_name}</td>
                  <td>{r.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default OwnerDashboard;
