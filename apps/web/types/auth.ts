export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
  twoFactorEnabled?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken?: string;
  requiresTwoFactor?: boolean;
  challengeToken?: string;
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  accessToken: string;
}
