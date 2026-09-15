import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AccessTokenPayload {
  userId: string;
  role: "BUYER" | "SELLER" | "ADMIN";
}

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authorization.substring(7);

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AccessTokenPayload;

    req.user = payload;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
}
