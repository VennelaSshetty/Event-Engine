import express from "express";

import { replayEventController }
from "../controllers/replayController.js";

const router = express.Router();

router.post("/:id/replay", replayEventController);

export default router;