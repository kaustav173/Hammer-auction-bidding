import type { NextFunction, Request, Response } from "express";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateUpdateUser(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;

  if (email === undefined) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required",
    });
  }

  if (typeof email !== "string") {
    return res.status(400).json({
      success: false,
      message: "Email must be a string",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  req.body = {
    email: normalizedEmail,
  };

  next();
}
