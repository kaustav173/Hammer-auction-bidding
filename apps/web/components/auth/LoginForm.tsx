"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { login, verifyTwoFactorLogin } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [challengeToken, setChallengeToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = challengeToken
        ? await verifyTwoFactorLogin(challengeToken, twoFactorCode)
        : await login({ email, password });

      if (response.requiresTwoFactor && response.challengeToken) {
        setChallengeToken(response.challengeToken);
        setError("");
        return;
      }

      if (!response.accessToken) throw new Error("Unable to establish a session");
      sessionStorage.setItem("accessToken", response.accessToken);

      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>

        <p className="mt-2 text-sm text-gray-500">Login to your HAMMR account</p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
          />
        </div>

        {challengeToken && (
          <div>
            <label htmlFor="twoFactorCode" className="mb-2 block text-sm font-medium text-gray-700">
              Microsoft Authenticator code
            </label>
            <input
              id="twoFactorCode"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={twoFactorCode}
              onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, ""))}
              required
              autoComplete="one-time-code"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
            />
          </div>
        )}

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Logging in..." : challengeToken ? "Verify code" : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-gray-900 hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
