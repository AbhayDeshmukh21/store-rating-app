// UserStores.jsx
import { useEffect, useState } from "react";
import apiRequest from "../api/api";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";

function UserStores() {
  const { token } = useAuth();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: "", address: "" });
  const [error, setError] = useState("");
  const [ratingStoreId, setRatingStoreId] = useState(null); // which store's rating widget is open

  function loadStores() {
    const params = new URLSearchParams();
    if (search.name) params.set("name", search.name);
    if (search.address) params.set("address", search.address);

    apiRequest(`/stores?${params.toString()}`, { token })
      .then(setStores)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchChange(e) {
    setSearch({ ...search, [e.target.name]: e.target.value });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadStores();
  }

  async function handleRate(store, ratingValue) {
    setError("");
    try {
      if (store.my_rating) {
        // Store already has a rating - modify it.
        // We need the rating's own id, which the store listing doesn't include,
        // so we look it up via the ratings the store owner-style endpoint won't
        // work for a normal user - instead we submit through POST/PUT logic below.
        await apiRequest(`/ratings/${store.rating_id}`, {
          method: "PUT",
          token,
          body: { rating: ratingValue },
        });
      } else {
        await apiRequest("/ratings", {
          method: "POST",
          token,
          body: { storeId: store.id, rating: ratingValue },
        });
      }
      setRatingStoreId(null);
      loadStores();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <h2>Stores</h2>
      {error && <p className="error-text">{error}</p>}

      <form className="filter-bar" onSubmit={handleSearchSubmit}>
        <input name="name" placeholder="Search by store name" value={search.name} onChange={handleSearchChange} />
        <input name="address" placeholder="Search by address" value={search.address} onChange={handleSearchChange} />
        <button type="submit">Search</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Store Name</th>
            <th>Address</th>
            <th>Overall Rating</th>
            <th>My Rating</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.address}</td>
              <td>{s.overall_rating ?? "No ratings"}</td>
              <td>{s.my_rating ?? "Not rated"}</td>
              <td>
                {ratingStoreId === s.id ? (
                  <StarRating value={s.my_rating} onSelect={(val) => handleRate(s, val)} />
                ) : (
                  <button onClick={() => setRatingStoreId(s.id)}>
                    {s.my_rating ? "Modify Rating" : "Rate Store"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserStores;
