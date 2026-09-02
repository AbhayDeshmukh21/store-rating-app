// AdminUserDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiRequest from "../api/api";
import { useAuth } from "../context/AuthContext";

function AdminUserDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest(`/users/${id}`, { token })
      .then(setUser)
      .catch((err) => setError(err.message));
  }, [id, token]);

  return (
    <div className="page">
      <Link to="/admin/users">&larr; Back to Users</Link>
      <h2>User Details</h2>
      {error && <p className="error-text">{error}</p>}

      {user && (
        <div className="card">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Address:</strong> {user.address}</p>
          <p><strong>Role:</strong> {user.role}</p>
          {user.role === "STORE_OWNER" && (
            <p><strong>Store Rating:</strong> {user.storeRating ?? "No ratings"}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminUserDetails;
