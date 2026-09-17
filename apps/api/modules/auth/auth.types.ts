import type { JwtPayload } from "jsonwebtoken";

export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface RegisterBody {
  email: string;
  password: string;
  role: "BUYER" | "SELLER";
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  sessionId: string;
  role: UserRole;
  type: "access";
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  sessionId: string;
  type: "refresh";
}
