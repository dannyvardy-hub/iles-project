import api from "./api";

export const fetchLogs = () => api.get("/logs/").then(r => r.data);
export const fetchPendingLogs = () => api.get("/logs/pending/").then(r => r.data);
export const fetchLogById = (id) => api.get(`/logs/${id}/`).then(r => r.data);
export const createLog = (data) => api.post("/logs/create/", data).then(r => r.data);
export const approveLog = (id) => api.patch(`/logs/${id}/approve/`).then(r => r.data);
export const returnLog = (id, feedback) => api.patch(`/logs/${id}/return/`, { feedback }).then(r => r.data);