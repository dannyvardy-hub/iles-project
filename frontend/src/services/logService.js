import api from "./api";

export const fetchLogs = () => api.get("/logs/").then(r => r.data);
export const fetchLogById = (id) => api.get(`/logs/${id}/`).then(r => r.data);
export const createLog = (data) => api.post("/logs/", data).then(r => r.data);
export const updateLog = (id, data) => api.put(`/logs/${id}/`, data).then(r => r.data);
export const deleteLog = (id) => api.delete(`/logs/${id}/delete/`).then(r => r.data);
export const submitLog = (id) => api.post(`/logs/${id}/submit/`, {}).then(r => r.data);
export const workApproveLog = (id, action, rating, feedback) =>
  api.post(`/logs/${id}/work-approval/`, { action, rating, feedback }).then(r => r.data);
export const academicEvaluateLog = (id, grade, comments) =>
  api.post(`/logs/${id}/academic-evaluation/`, { grade, comments }).then(r => r.data);
export const fetchLogHistory = (id) => api.get(`/logs/${id}/history/`).then(r => r.data);