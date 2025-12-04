// src/api/privateAPI.js
import instance from "@/lib/axios";

/* ========================== */
/* User: Auth Functions       */
/* ========================== */

const registerUser = async (data) => {
  return await instance.apiClient.post("/api/v1/auth/register", data, {
    headers: instance.publicHeaders(),
  });
};

const loginUser = async (data) => {
  return await instance.apiClient.post("/api/v1/auth/login", data, {
    headers: instance.publicHeaders(),
  });
};

/* ========================== */
/* Dashboard (Public)         */
/* ========================== */

const getDashboardSummary = async () => {
  return await instance.apiClient.get("/api/v1/donations/dashboard", {
    headers: instance.publicHeaders(),
  });
};

/* ========================== */
/* Categories (Protected)     */
/* ========================== */

const getCategories = async () => {
  return await instance.apiClient.get("/api/v1/donations/categories", {
    headers: instance.defaultHeaders(),
  });
};

const createCategory = async (data) => {
  return await instance.apiClient.post("/api/v1/donations/categories", data, {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Items (Protected)          */
/* ========================== */

const getItems = async () => {
  return await instance.apiClient.get("/api/v1/donations/items", {
    headers: instance.defaultHeaders(),
  });
};

const getItemsByCategory = async () => {
  return await instance.apiClient.get("/api/v1/donations/items/by-category", {
    headers: instance.defaultHeaders(),
  });
};

const createItem = async (data) => {
  return await instance.apiClient.post("/api/v1/donations/items", data, {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Stock Movements (Protected)*/
/* ========================== */

const stockIn = async (data) => {
  // data: { item_id, quantity, reason? }
  return await instance.apiClient.post("/api/v1/donations/stock/in", data, {
    headers: instance.defaultHeaders(),
  });
};

const stockOut = async (data) => {
  // data: { item_id, quantity, reason? }
  return await instance.apiClient.post("/api/v1/donations/stock/out", data, {
    headers: instance.defaultHeaders(),
  });
};

const getItemHistory = async (itemId) => {
  return await instance.apiClient.get(`/api/v1/donations/stock/history/${itemId}`, {
    headers: instance.defaultHeaders(),
  });
};

const importDonationsCsv = async (formData) => {
  return await instance.apiClient.post("/api/v1/uploads/import", formData, {
    headers: instance.defaultHeaders("multipart/form-data"),
  });
};

/* ========================== */
/* Export API                 */
/* ========================== */

const privateAPI = {
  // Auth
  registerUser,
  loginUser,

  // Dashboard
  getDashboardSummary,

  // Categories
  getCategories,
  createCategory,

  // Items
  getItems,
  getItemsByCategory,
  createItem,

  // Stock Movements
  stockIn,
  stockOut,
  getItemHistory,

  // Imports
  importDonationsCsv,
};

export default privateAPI;
