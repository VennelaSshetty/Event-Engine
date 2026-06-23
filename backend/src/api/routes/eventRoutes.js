import express from "express";
import { getEvents, createEvent } from "../controllers/eventController.js";
import { getEventById } from "../controllers/eventController.js";

import authMiddleware from "../../middlewares/authMiddleware.js";
import rateLimitMiddleware from "../../middlewares/rateLimitMiddleware.js";

import asyncHandler from "../../middlewares/asyncHandler.js";

const router = express.Router();

router.use(authMiddleware, rateLimitMiddleware);

//router.use(rateLimitMiddleware);

router.get("/", asyncHandler(getEvents));

router.post("/", asyncHandler(createEvent));

router.get("/:id", asyncHandler(getEventById));

export default router;