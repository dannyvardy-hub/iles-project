import api from "./api";

export const fetchStats = () => api.get("/evaluations/stats/").then(r => r.data);
export const fetchStudents = () => api.get("/evaluations/students/").then(r => r.data);
export const fetchStudentById = (id) => api.get(`/evaluations/students/${id}/`).then(r => r.data);
export const submitEvaluation = (data) => api.post("/evaluations/", data).then(r => r.data);