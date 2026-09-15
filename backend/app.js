import express from "express";
import cors from "cors";

import eventRoutes from "./src/api/routes/eventRoutes.js";
import replayRoutes from "./src/api/routes/replayRoutes.js";
import dlqRoutes from "./src/api/routes/dlqRoutes.js";
import dashboardRoutes from "./src/api/routes/dashboardRoutes.js";
import workflowRoutes from "./src/api/routes/workflowRoutes.js";
import metricsRoutes from "./src/api/routes/metricsRoutes.js";

import correlationMiddleware from "./src/middlewares/correlationMiddleware.js";
import errorMiddleware from "./src/middlewares/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(correlationMiddleware);

app.use("/api/events", eventRoutes);
app.use("/api/replay", replayRoutes);
app.use("/api/dlq", dlqRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/metrics", metricsRoutes);

app.use(errorMiddleware);

export default app;