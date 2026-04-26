import api from "./api";

export const fetchEvaluations = () => api.get("/evaluations/").then(r => r.data);
export const fetchEvaluationById = (id) => api.get(`/evaluations/${id}/`).then(r => r.data);
export const submitEvaluation = (data) => api.post("/evaluations/", data).then(r => r.data);
export const fetchCriteria = () => api.get("/evaluations/criteria/").then(r => r.data);
export const submitCriteria = (data) => api.post("/evaluations/criteria/", data).then(r => r.data);