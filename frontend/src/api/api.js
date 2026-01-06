import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
});

/* ---------- USERS ---------- */
export const getUsers = () => api.get("/api/users");

export const createUser = (name, timezone) =>
  api.post("/api/users", { name, timezone });

export const updateUserTimezone = (userId, timezone) =>
  api.put(`/api/users/${userId}/timezone`, { timezone });

/* ---------- EVENTS ---------- */
export const createEvent = (data) => api.post("/api/events", data);

export const getEvents = (userId) =>
  api.get("/api/events", {
    params: { userId },
  });

export const updateEvent = (eventId, data) =>
  api.put(`/api/events/${eventId}`, data);

/* ---------- LOGS ---------- */
export const getEventLogs = (eventId) => api.get(`/api/events/${eventId}/logs`);

export default api;
