import api from "./api";

export const fetchNotifications = () => api.get("/notifications/").then(r => r.data);
export const fetchUnreadCount = () => api.get("/notifications/unread-count/").then(r => r.data);
export const markAsRead = (id) => api.post(`/notifications/${id}/read/`).then(r => r.data);
export const markAllAsRead = () => api.post("/notifications/mark-all-read/").then(r => r.data);