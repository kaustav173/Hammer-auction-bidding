import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());


app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Hammr API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);

export default app;