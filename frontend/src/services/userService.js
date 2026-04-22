import api from "./api";

export const fetchUsers = () => api.get("/users/").then(r => r.data);
export const fetchAdminStats = () => api.get("/users/stats/").then(r => r.data);