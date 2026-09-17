"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import type { User } from "@/types/auth";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("accessToken");
}

interface MeResponse {
  success: boolean;
  user: User;
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch<MeResponse>("/auth/me", { token })
      .then((response) => setUser(response.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}