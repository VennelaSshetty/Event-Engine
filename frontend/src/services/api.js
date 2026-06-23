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