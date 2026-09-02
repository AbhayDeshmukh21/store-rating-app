// AdminUsers.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiRequest from "../api/api";
import { useAuth } from "../context/AuthContext";

function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [error, setError] = useState("");

  // Create-user form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", address: "", role: "USER" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  function loadUsers() {
    const params = new URLSearchParams();
    if (filters.name) params.set("name", filters.name);
    if (filters.email) params.set("email", filters.email);
    if (filters.address) params.set("address", filters.address);
    if (filters.role) params.set("role", filters.role);
    params.set("sortBy", sortBy);
    params.set("order", order);

    apiRequest(`/users?${params.toString()}`, { token })
      .then(setUsers)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, order]);

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleSearch(e) {
    e.preventDefault();
    loadUsers();
  }

  function toggleSort(field) {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (form.name.length < 20 || form.name.length > 60) {
      setFormError("Name must be between 20 and 60 characters.");
      return;
    }

    try {
      await apiRequest("/users", { method: "POST", token, body: form });
      setFormSuccess("User created successfully.");
      setForm({ name: "", email: "", password: "", address: "", role: "USER" });
      loadUsers();
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <div className="page">
      <h2>Users</h2>
      {error && <p className="error-text">{error}</p>}

      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? "Cancel" : "Add User"}
      </button>

      {showCreateForm && (
        <form className="card form" onSubmit={handleCreateUser}>
          <h3>Add New User</h3>
          {formError && <p className="error-text">{formError}</p>}
          {formSuccess && <p className="success-text">{formSuccess}</p>}

          <label>Name (20-60 characters)</label>
          <input name="name" value={form.name} onChange={handleFormChange} required />

          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleFormChange} required />

          <label>Password (8-16 chars, 1 uppercase, 1 special char)</label>
          <input type="password" name="password" value={form.password} onChange={handleFormChange} required />

          <label>Address (max 400 characters)</label>
          <textarea name="address" value={form.address} onChange={handleFormChange} required />

          <label>Role</label>
          <select name="role" value={form.role} onChange={handleFormChange}>
            <option value="USER">Normal User</option>
            <option value="ADMIN">Admin User</option>
          </select>

          <button type="submit">Create User</button>
        </form>
      )}

      <form className="filter-bar" onSubmit={handleSearch}>
        <input name="name" placeholder="Name" value={filters.name} onChange={handleFilterChange} />
        <input name="email" placeholder="Email" value={filters.email} onChange={handleFilterChange} />
        <input name="address" placeholder="Address" value={filters.address} onChange={handleFilterChange} />
        <select name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Normal User</option>
          <option value="STORE_OWNER">Store Owner</option>
        </select>
        <button type="submit">Search</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort("name")}>Name {sortBy === "name" && (order === "asc" ? "↑" : "↓")}</th>
            <th onClick={() => toggleSort("email")}>Email {sortBy === "email" && (order === "asc" ? "↑" : "↓")}</th>
            <th onClick={() => toggleSort("address")}>Address</th>
            <th onClick={() => toggleSort("role")}>Role {sortBy === "role" && (order === "asc" ? "↑" : "↓")}</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.address}</td>
              <td>{u.role}</td>
              <td>
                <Link to={`/admin/users/${u.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
