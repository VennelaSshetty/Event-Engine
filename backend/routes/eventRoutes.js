import express from "express";
import { getEvents, createEvent } from "../controllers/eventController.js";
import { getEventById } from "../controllers/eventController.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", createEvent);
router.get("/:id", getEventById);

export default router;