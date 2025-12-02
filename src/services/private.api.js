// src/api/privateAPI.js (or wherever this file lives)
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
// Anyone can see the dashboard summary
const getDashboardSummary = async () => {
  return await instance.apiClient.get("/api/v1/donations/summary", {
    headers: instance.publicHeaders(),
  });
};

/* ========================== */
/* Categories & Items (Public)*/
/* ========================== */
// Read-only lists, no auth needed

const getCategories = async () => {
  return await instance.apiClient.get("/api/v1/donations/categories", {
    headers: instance.defaultHeaders(),
  });
};

const getItems = async () => {
  return await instance.apiClient.get("/api/v1/donations/items", {
    headers: instance.defaultHeaders(),
  });
};

const getItemsByCategory = async (categoryId) => {
  return await instance.apiClient.get(`/api/v1/donations/items/category/${categoryId}`, {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Donations (Protected)      */
/* ========================== */

const createDonation = async (data) => {
  return await instance.apiClient.post("/api/v1/donations/donations", data, {
    headers: instance.defaultHeaders(),
  });
};

const getDonations = async () => {
  return await instance.apiClient.get("/api/v1/donations/donations", {
    headers: instance.defaultHeaders(),
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

  // Categories & Items
  getCategories,
  getItems,
  getItemsByCategory,

  // Donations
  createDonation,
  getDonations,
};

export default privateAPI;
