import express from "express";
import cors from "cors";
import config from "./src/config/env.js";
import connectDB from "./src/config/db.js";
import eventRoutes from "./src/api/routes/eventRoutes.js";

import correlationMiddleware from "./src/middlewares/correlationMiddleware.js";

import errorMiddleware from "./src/middlewares/errorMiddleware.js";

import replayRoutes from "./src/api/routes/replayRoutes.js";
import dlqRoutes from "./src/api/routes/dlqRoutes.js";

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use(correlationMiddleware);

app.use("/api/events", eventRoutes);
app.use("/api/replay", replayRoutes);
app.use("/api/dlq", dlqRoutes);

app.use(errorMiddleware);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});