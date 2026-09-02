// AdminStores.jsx
import { useEffect, useState } from "react";
import apiRequest from "../api/api";
import { useAuth } from "../context/AuthContext";

function AdminStores() {
  const { token } = useAuth();
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [filters, setFilters] = useState({ name: "", address: "" });
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", address: "", ownerId: "" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  function loadStores() {
    const params = new URLSearchParams();
    if (filters.name) params.set("name", filters.name);
    if (filters.address) params.set("address", filters.address);
    params.set("sortBy", sortBy);
    params.set("order", order);

    apiRequest(`/stores?${params.toString()}`, { token })
      .then(setStores)
      .catch((err) => setError(err.message));
  }

  function loadOwners() {
    // Reuse the users listing, filtered to Store Owners, to populate the dropdown
    apiRequest(`/users?role=STORE_OWNER`, { token })
      .then(setOwners)
      .catch(() => {});
  }

  useEffect(() => {
    loadStores();
    loadOwners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, order]);

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleSearch(e) {
    e.preventDefault();
    loadStores();
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

  async function handleCreateStore(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    try {
      await apiRequest("/stores", {
        method: "POST",
        token,
        body: { ...form, ownerId: form.ownerId ? Number(form.ownerId) : null },
      });
      setFormSuccess("Store created successfully.");
      setForm({ name: "", email: "", address: "", ownerId: "" });
      loadStores();
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <div className="page">
      <h2>Stores</h2>
      {error && <p className="error-text">{error}</p>}

      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? "Cancel" : "Add Store"}
      </button>

      {showCreateForm && (
        <form className="card form" onSubmit={handleCreateStore}>
          <h3>Add New Store</h3>
          {formError && <p className="error-text">{formError}</p>}
          {formSuccess && <p className="success-text">{formSuccess}</p>}

          <label>Store Name</label>
          <input name="name" value={form.name} onChange={handleFormChange} required />

          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleFormChange} required />

          <label>Address (max 400 characters)</label>
          <textarea name="address" value={form.address} onChange={handleFormChange} required />

          <label>Store Owner</label>
          <select name="ownerId" value={form.ownerId} onChange={handleFormChange}>
            <option value="">-- None --</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
            ))}
          </select>

          <button type="submit">Create Store</button>
        </form>
      )}

      <form className="filter-bar" onSubmit={handleSearch}>
        <input name="name" placeholder="Name" value={filters.name} onChange={handleFilterChange} />
        <input name="address" placeholder="Address" value={filters.address} onChange={handleFilterChange} />
        <button type="submit">Search</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort("name")}>Name {sortBy === "name" && (order === "asc" ? "↑" : "↓")}</th>
            <th onClick={() => toggleSort("email")}>Email</th>
            <th onClick={() => toggleSort("address")}>Address</th>
            <th onClick={() => toggleSort("rating")}>Rating {sortBy === "rating" && (order === "asc" ? "↑" : "↓")}</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.address}</td>
              <td>{s.overall_rating ?? "No ratings"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminStores;
