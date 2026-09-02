// api.js
// A tiny helper around fetch() so every page doesn't have to repeat the
// same boilerplate (base URL, JSON headers, attaching the JWT token).

const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Throw the backend's error message so calling code can show it to the user
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

export default apiRequest;
