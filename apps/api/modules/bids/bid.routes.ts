import { Router } from "express";
import { authenticate, requireRole } from "../../middleware/auth.middleware.js";
import { validatePlaceBid } from "./bid.validation.js";
import { createBid } from "./bid.controller.js";

const router = Router();

router.post("/:auctionId", authenticate, requireRole("BUYER"), validatePlaceBid, createBid);

export default router;
