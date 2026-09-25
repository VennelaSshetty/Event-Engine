import app from "./app.js";
import mongoose from "mongoose";

import config from "./src/config/env.js";
import connectDB from "./src/config/db.js";

await connectDB();

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`Graceful shutdown initiated: ${signal}`);

  try {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log("HTTP server closed");
          resolve();
        }
      });
    });

    await mongoose.connection.close();

    console.log("MongoDB connection closed");
    console.log("Graceful shutdown completed");

    process.exit(0);
  } catch (err) {
    console.error("Graceful shutdown failed:", err.message);

    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));