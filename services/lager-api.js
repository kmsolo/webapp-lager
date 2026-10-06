import { getToken, logout } from "./auth.js";

const BASE_URL = "https://dbwebbyearone.ddev.site:3013";

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // tom eller ogiltig body
  }

  // Utgången/ogiltig token: logga ut (inloggningsfel har ingen token och hamnar inte här)
  if (response.status === 401 && token) {
    logout();
  }

  if (!response.ok) {
    const error = new Error(data?.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

// --- AUTH ---

export const register = (email, password) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const login = (email, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

// --- PRODUCTS ---

export const getProducts = () => request("/products");

export const getProduct = (id) =>
  request(`/products/${encodeURIComponent(id)}`);

export const createProduct = (product) =>
  request("/products", {
    method: "POST",
    body: JSON.stringify(product),
  });

export const updateProduct = (product) =>
  request(`/products/${encodeURIComponent(product.id)}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });

export const deleteProduct = (id) =>
  request(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });

// --- DELIVERIES ---

export const getDeliveries = () => request("/deliveries");

export const createDelivery = (delivery) =>
  request("/deliveries", {
    method: "POST",
    body: JSON.stringify(delivery),
  });

// --- ORDERS ---

export const getOrders = (status) =>
  request(status ? `/orders?status=${encodeURIComponent(status)}` : "/orders");

export const createOrder = (order) =>
  request("/orders", {
    method: "POST",
    body: JSON.stringify(order),
  });

// --- INVOICES ---

export const getInvoices = () => request("/invoices");

export const createInvoice = (invoice) =>
  request("/invoices", {
    method: "POST",
    body: JSON.stringify(invoice),
  });
