import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "x-api-key": import.meta.env.VITE_API_KEY
  }
});

// CREATE EVENT
export const createEvent = (data) => API.post("/events", data);

// GET EVENTS
export const getEvents = () => API.get("/events");