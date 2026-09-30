const API_BASE = import.meta.env.VITE_API_URL || "";

export function getAuthToken() {
  return localStorage.getItem("priyas_boutique_token") || "";
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("priyas_boutique_token", token);
  } else {
    localStorage.removeItem("priyas_boutique_token");
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
<<<<<<< HEAD

  // If body is FormData, do NOT set Content-Type manually
  // (browser will set multipart/form-data with the correct boundary)
  const isFormData = options.body instanceof FormData;

  const headers = isFormData
    ? {}
    : { "Content-Type": "application/json", ...options.headers };
=======
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
>>>>>>> e7e6b1fdda60d6a018b2b45a096cf4611c31f1a8

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const contentType = res.headers.get("content-type");
    let data = {};
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { message: text };
    }

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.warn(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),
<<<<<<< HEAD
  post: (endpoint, body) =>
    request(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint, body) =>
    request(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
=======
  post: (endpoint, body) => request(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: "PUT", body: JSON.stringify(body) }),
>>>>>>> e7e6b1fdda60d6a018b2b45a096cf4611c31f1a8
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

export default api;
