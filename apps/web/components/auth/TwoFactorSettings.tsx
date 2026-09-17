"use client";

import { useState } from "react";
import { disableTwoFactor, setupTwoFactor, verifyTwoFactorSetup } from "@/lib/auth";
import { getAccessToken } from "@/lib/session";

export default function TwoFactorSettings({
  initiallyEnabled = false,
}: {
  initiallyEnabled?: boolean;
}) {
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function beginSetup() {
    const token = getAccessToken();
    if (!token) return;
    setError("");
    try {
      const response = await setupTwoFactor(token);
      setQrCode(response.qrCode);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to start setup");
    }
  }

  async function confirmSetup() {
    const token = getAccessToken();
    if (!token) return;
    try {
      await verifyTwoFactorSetup(token, code);
      setEnabled(true);
      setQrCode("");
      setMessage("Microsoft Authenticator is enabled.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Invalid code");
    }
  }

  async function disable() {
    const token = getAccessToken();
    if (!token) return;
    await disableTwoFactor(token);
    setEnabled(false);
    setMessage("Two-factor authentication is disabled.");
  }

  return (
    <section className="mt-10 max-w-xl border-t border-gray-200 pt-8">
      <h2 className="text-xl font-semibold text-gray-900">Account security</h2>
      <p className="mt-1 text-sm text-gray-500">Protect login with Microsoft Authenticator.</p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
      {enabled ? (
        <button
          onClick={disable}
          className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold"
        >
          Disable 2FA
        </button>
      ) : qrCode ? (
        <div className="mt-4 space-y-4">
          <img src={qrCode} alt="Microsoft Authenticator setup QR code" className="h-48 w-48" />
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            maxLength={6}
            inputMode="numeric"
            placeholder="6-digit code"
            className="block rounded-lg border border-gray-300 px-4 py-2 text-sm"
          />
          <button
            onClick={confirmSetup}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Confirm setup
          </button>
        </div>
      ) : (
        <button
          onClick={beginSetup}
          className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Set up Microsoft Authenticator
        </button>
      )}
    </section>
  );
}
