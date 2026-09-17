"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

type RegistrationRole = "BUYER" | "SELLER";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RegistrationRole>("BUYER");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await register({ email, password, role });
      if (!response.accessToken) {
        throw new Error("Unable to establish a session");
      }
      sessionStorage.setItem("accessToken", response.accessToken);
      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-2 text-sm text-gray-500">Join HAMMR and start bidding</p>
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
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
          />
        </div>

        {/* Password */}
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
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
          />
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="mb-2 block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value as RegistrationRole)}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
          >
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
          </select>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-gray-900 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
