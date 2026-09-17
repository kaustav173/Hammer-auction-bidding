import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { createOrder, verifyPayment } from "./payment.controller.js";

const router = Router();

router.post("/create-order", authenticate, createOrder);
router.post("/verify-payment", authenticate, verifyPayment);

export default router;
