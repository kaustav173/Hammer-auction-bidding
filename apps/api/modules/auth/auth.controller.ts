import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { users } from "../../db/schema/user.js";
import { sessions } from "../../db/schema/session.ts";

import type { AccessTokenPayload, RefreshTokenPayload, UserRole } from "./auth.types.js";

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return secret;
}

function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
function generateAccessToken(userId: string, sessionId: string, role: UserRole): string {
  return jwt.sign(
    {
      userId,
      sessionId,
      role,
      type: "access",
    },
    getAccessSecret(),
    {
      expiresIn: "15m",
    },
  );
}

function generateRefreshToken(userId: string, sessionId: string): string {
  return jwt.sign(
    {
      userId,
      sessionId,
      type: "refresh",
    },
    getRefreshSecret(),
    {
      expiresIn: "7d",
    },
  );
}

function getRefreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,

    secure: isProduction,

    sameSite: "strict" as const,

    maxAge: 7 * 24 * 60 * 60 * 1000,

    path: "/api/auth",
  };
}

export async function registerUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const [existingUser] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        role: "BUYER",
      })
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: "Unable to create user",
      });
    }

    const [session] = await db
      .insert(sessions)
      .values({
        userId: newUser.id,
        refreshTokenHash: "pending",
        revoked: false,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] ?? "unknown",
      })
      .returning({
        id: sessions.id,
      });

    if (!session) {
      return res.status(500).json({
        success: false,
        message: "Unable to create session",
      });
    }

    const refreshToken = generateRefreshToken(newUser.id, session.id);

    const refreshTokenHash = hashRefreshToken(refreshToken);

    await db
      .update(sessions)
      .set({
        refreshTokenHash,
      })
      .where(eq(sessions.id, session.id));

    const accessToken = generateAccessToken(newUser.id, session.id, newUser.role);

    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

    return res.status(201).json({
      success: true,
      message: "User registered successfully",

      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },

      accessToken,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const [session] = await db
      .insert(sessions)
      .values({
        userId: user.id,
        refreshTokenHash: "pending",
        revoked: false,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] ?? "unknown",
      })
      .returning({
        id: sessions.id,
      });

    if (!session) {
      return res.status(500).json({
        success: false,
        message: "Unable to create session",
      });
    }

    const refreshToken = generateRefreshToken(user.id, session.id);

    const refreshTokenHash = hashRefreshToken(refreshToken);

    await db
      .update(sessions)
      .set({
        refreshTokenHash,
      })
      .where(eq(sessions.id, session.id));

    const accessToken = generateAccessToken(user.id, session.id, user.role);

    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",

      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },

      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authorization.substring(7);

    let decoded: AccessTokenPayload;

    try {
      decoded = jwt.verify(token, getAccessSecret()) as AccessTokenPayload;
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }

    if (decoded.type !== "access" || !decoded.userId || !decoded.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    const [session] = await db
      .select({
        id: sessions.id,
        revoked: sessions.revoked,
      })
      .from(sessions)
      .where(and(eq(sessions.id, decoded.sessionId), eq(sessions.userId, decoded.userId)))
      .limit(1);

    if (!session || session.revoked) {
      return res.status(401).json({
        success: false,
        message: "Session is no longer active",
      });
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    let decoded: RefreshTokenPayload;

    try {
      decoded = jwt.verify(refreshToken, getRefreshSecret()) as RefreshTokenPayload;
    } catch {
      res.clearCookie("refreshToken", getRefreshCookieOptions());

      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    if (decoded.type !== "refresh" || !decoded.userId || !decoded.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);

    const [session] = await db
      .select({
        id: sessions.id,
        userId: sessions.userId,
        refreshTokenHash: sessions.refreshTokenHash,
        revoked: sessions.revoked,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.id, decoded.sessionId),
          eq(sessions.userId, decoded.userId),
          eq(sessions.refreshTokenHash, refreshTokenHash),
          eq(sessions.revoked, false),
        ),
      )
      .limit(1);

    if (!session) {
      res.clearCookie("refreshToken", getRefreshCookieOptions());

      return res.status(401).json({
        success: false,
        message: "Invalid session or refresh token",
      });
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const newRefreshToken = generateRefreshToken(user.id, session.id);

    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    await db
      .update(sessions)
      .set({
        refreshTokenHash: newRefreshTokenHash,
      })
      .where(eq(sessions.id, session.id));

    const newAccessToken = generateAccessToken(user.id, session.id, user.role);

    res.cookie("refreshToken", newRefreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function logoutUser(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    let decoded: RefreshTokenPayload;

    try {
      decoded = jwt.verify(refreshToken, getRefreshSecret()) as RefreshTokenPayload;
    } catch {
      res.clearCookie("refreshToken", getRefreshCookieOptions());

      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (decoded.type !== "refresh" || !decoded.userId || !decoded.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);

    const [session] = await db
      .select({
        id: sessions.id,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.id, decoded.sessionId),
          eq(sessions.userId, decoded.userId),
          eq(sessions.refreshTokenHash, refreshTokenHash),
          eq(sessions.revoked, false),
        ),
      )
      .limit(1);

    if (!session) {
      res.clearCookie("refreshToken", getRefreshCookieOptions());

      return res.status(401).json({
        success: false,
        message: "Session not found",
      });
    }

    await db
      .update(sessions)
      .set({
        revoked: true,
      })
      .where(eq(sessions.id, session.id));

    res.clearCookie("refreshToken", getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function logoutAllSessions(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    let decoded: RefreshTokenPayload;

    try {
      decoded = jwt.verify(refreshToken, getRefreshSecret()) as RefreshTokenPayload;
    } catch {
      res.clearCookie("refreshToken", getRefreshCookieOptions());

      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (decoded.type !== "refresh" || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    await db
      .update(sessions)
      .set({
        revoked: true,
      })
      .where(eq(sessions.userId, decoded.userId));

    res.clearCookie("refreshToken", getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      message: "User logged out of all sessions",
    });
  } catch (error) {
    console.error("Logout all error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
