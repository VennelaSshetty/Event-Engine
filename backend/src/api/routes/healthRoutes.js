import express from "express";

import {
  live,
  ready,
  health
} from "../controllers/healthController.js";

const router = express.Router();

router.get("/live", live);
router.get("/ready", ready);
router.get("/health", health);

export default router;