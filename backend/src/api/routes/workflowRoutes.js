import express from "express";

import {
  getWorkflowTracker
}
from "../controllers/workflowController.js";

const router = express.Router();

router.get(
  "/tracker",
  getWorkflowTracker
);

export default router;