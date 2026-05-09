import express from "express";
import { getEvents, createEvent } from "../controllers/eventController.js";
import { getEventById } from "../controllers/eventController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import rateLimitMiddleware from "../middlewares/rateLimitMiddleware.js";

const router = express.Router();

router.use(authMiddleware, rateLimitMiddleware);

router.get("/", getEvents);
router.post("/", createEvent);
router.get("/:id", getEventById);

export default router;