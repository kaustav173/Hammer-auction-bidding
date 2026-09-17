import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessions } from "../db/schema/session.js";
import type { AccessTokenPayload, UserRole } from "../modules/auth/auth.types.js";

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not configured");
  return secret;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const token = authorization.substring(7);
    const payload = jwt.verify(token, getAccessSecret()) as AccessTokenPayload;

    if (payload.type !== "access" || !payload.userId || !payload.sessionId) {
      return res.status(401).json({ success: false, message: "Invalid access token" });
    }

    // Verify session is still active and not revoked
    const [session] = await db
      .select({ id: sessions.id, revoked: sessions.revoked })
      .from(sessions)
      .where(and(eq(sessions.id, payload.sessionId), eq(sessions.userId, payload.userId)))
      .limit(1);

    if (!session || session.revoked) {
      return res.status(401).json({ success: false, message: "Session is no longer active" });
    }

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired access token" });
  }
}

// Section 11: "Example role middleware: requireRole('SELLER')"
export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "You do not have permission to perform this action" });
    }
    next();
  };
}
