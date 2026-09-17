import type { Request, Response, NextFunction } from "express";

export function validatePlaceBid(req: Request, res: Response, next: NextFunction) {
  const { amount } = req.body;

  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "amount must be a positive integer (minor currency units, e.g. paise)",
    });
  }

  req.body = { amount };
  next();
}
