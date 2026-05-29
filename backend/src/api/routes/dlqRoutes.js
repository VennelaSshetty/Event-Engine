import express from "express";
import {
  getDLQEvents,
  replayEventFromDLQ  
} from "../controllers/dlqController.js";

const router = express.Router();

router.get("/", getDLQEvents);
router.post("/replay", replayEventFromDLQ);

export default router;