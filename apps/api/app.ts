import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes.js";
import auctionRoutes from "./modules/auction/auction.routes.js";
import bidRoutes from "./modules/bid/bid.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import auctionRoutes from "./modules/auctions/auction.routes.js";
import bidRoutes from "./modules/bids/bid.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Hammr API is running", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api", paymentRoutes);

app.use(errorMiddleware); // must be last

export default app;
