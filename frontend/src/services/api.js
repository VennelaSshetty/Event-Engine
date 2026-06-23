// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api", // change if your backend port differs
// });

// // If you use authMiddleware, add token here later
// API.interceptors.request.use((req) => {
//   // Example if needed later:
//   // req.headers.Authorization = `Bearer ${token}`;
//   return req;
// });

// // --------------------
// // EVENTS
// // --------------------
// export const fetchEvents = async (page = 1, limit = 10) => {
//   const res = await API.get(`/events?page=${page}&limit=${limit}`);
//   return res.data.data;
// };

// // --------------------
// // DLQ
// // --------------------
// export const fetchDLQ = async () => {
//   const res = await API.get("/dlq");
//   return res.data.data;
// };

// // --------------------
// // REPLAY
// // --------------------
// export const replayDLQEvent = async (id) => {
//   const res = await API.post(`/replay/${id}/replay`);
//   return res.data;
// };

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const fetchDashboard = async () => {
  const res = await API.get("/dashboard");
  return res.data;
};

export const fetchDLQ = async () => {
  const res = await API.get("/dlq");
  return res.data.data;
};

export const replayDLQEvent = async (id) => {
  const res = await API.post(`/replay/${id}/replay`);
  return res.data;
};