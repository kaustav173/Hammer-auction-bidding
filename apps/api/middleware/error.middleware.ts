import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ?? {}),
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ success: false, message: "Internal server error" });
}
