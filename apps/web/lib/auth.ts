import { apiFetch } from "./api";

import type { AuthResponse, RefreshResponse } from "@/types/auth";

interface RegisterData {
  email: string;
  password: string;
  role: "BUYER" | "SELLER";
}

interface LoginData {
  email: string;
  password: string;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: LoginData): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyTwoFactorLogin(
  challengeToken: string,
  token: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login/2fa", {
    method: "POST",
    body: JSON.stringify({ challengeToken, token }),
  });
}

export async function setupTwoFactor(token: string) {
  return apiFetch<{ qrCode: string; secret: string }>("/auth/2fa/setup", {
    method: "POST",
    token,
  });
}

export async function verifyTwoFactorSetup(token: string, code: string) {
  return apiFetch("/auth/2fa/verify", {
    method: "POST",
    token,
    body: JSON.stringify({ token: code }),
  });
}

export async function disableTwoFactor(token: string) {
  return apiFetch("/auth/2fa/disable", { method: "POST", token });
}

export async function refreshAccessToken(): Promise<RefreshResponse> {
  return apiFetch<RefreshResponse>("/auth/refresh", {
    method: "POST",
  });
}

export async function logout() {
  return apiFetch("/auth/logout", {
    method: "POST",
  });
}

export async function logoutAll() {
  return apiFetch("/auth/logout-all", {
    method: "POST",
  });
}
