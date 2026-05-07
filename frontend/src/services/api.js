const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    let detail = `API request failed: ${response.status}`;
    let payload = null;
    try {
      payload = await response.json();
      detail = payload.detail?.message || payload.detail || detail;
    } catch {
      // Keep the default message when the response body is empty or non-JSON.
    }
    const error = new Error(detail);
    error.payload = payload;
    throw error;
  }
  return response.json();
}

export function getProducts(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return fetchJson(`/api/products${query}`);
}

export function getPrices({ search = "", city = "" } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (city) params.set("city", city);
  const query = params.toString() ? `?${params.toString()}` : "";
  return fetchJson(`/api/prices${query}`);
}

export function getProductDetail(productId) {
  return fetchJson(`/api/products/${productId}`);
}

export function getProductCategories() {
  return fetchJson("/api/products/categories");
}

export function getProfile(userId) {
  return fetchJson(`/api/profile/${userId}`);
}

export function getMapStats({ category = "", region = "" } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (region) params.set("region", region);
  const query = params.toString() ? `?${params.toString()}` : "";
  return fetchJson(`/api/stats/map${query}`);
}

export function analyzeSubmission(formData) {
  return fetchJson("/api/submit/analyze", {
    method: "POST",
    body: formData,
  });
}

export function submitPrice(formData) {
  return fetchJson("/api/submit", {
    method: "POST",
    body: formData,
  });
}
