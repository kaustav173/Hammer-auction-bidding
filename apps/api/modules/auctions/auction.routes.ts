import { Router } from "express";
import { authenticate, requireRole } from "../../middleware/auth.middleware.js";
import { validateCreateAuction } from "./auction.validation.js";
import {
  createAuctionHandler,
  getAuctionHandler,
  listAuctionsHandler,
  listMyAuctionsHandler,
} from "./auction.controller.js";

const router = Router();

router.get("/", listAuctionsHandler);
router.get("/mine", authenticate, requireRole("SELLER"), listMyAuctionsHandler);
router.get("/:id", getAuctionHandler);
router.post("/", authenticate, requireRole("SELLER"), validateCreateAuction, createAuctionHandler);

export default router;
