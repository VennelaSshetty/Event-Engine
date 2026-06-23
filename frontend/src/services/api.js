import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
});

export const fetchDashboard = async () => {
  const res = await API.get("/dashboard");
  return res.data;
};

export const fetchDLQ = async () => {
  const res = await API.get("/dlq");
  return res.data.data;
};

export const replayDLQEvent = async (eventId) => {

  const res = await API.post(
    `/replay/${eventId}/replay`,
    {
      reason: "Manual replay from dashboard"
    }
  );

  return res.data;
};

export const fetchWorkflowTracker =
async () => {

  const res = await API.get(
    "/workflows/tracker"
  );

  return res.data.data;
};