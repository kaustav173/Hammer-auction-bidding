import { Router } from "express";

import { placeBid } from "./bid.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/:auctionId", authenticate, placeBid);

export default router;
