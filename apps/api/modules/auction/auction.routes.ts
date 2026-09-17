import { Router } from "express";

import { listAuctions, getAuction, listMyAuctions, createAuction } from "./auction.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", listAuctions);
router.get("/mine", authenticate, listMyAuctions);
router.get("/:id", getAuction);

router.post("/", authenticate, createAuction);

export default router;
