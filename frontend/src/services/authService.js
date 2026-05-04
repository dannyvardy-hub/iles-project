import axios from "axios";

const BASE = "http://localhost:8000/api";

export const login = async (username, password) => {
  const res = await axios.post(`${BASE}/auth/token/`, { username, password });
  localStorage.setItem("access_token", res.data.access);
  localStorage.setItem("refresh_token", res.data.refresh);
  const payload = JSON.parse(atob(res.data.access.split(".")[1]));
  const user = { id: payload.user_id, username: payload.username, role: payload.role };
  localStorage.setItem("user", JSON.stringify(user));
  return user;
};

export const logout = () => localStorage.clear();

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
};

export const isAuthenticated = () => !!localStorage.getItem("access_token");