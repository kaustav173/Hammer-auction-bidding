"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { getAccessToken, useCurrentUser } from "@/lib/session";
import { formatMoney } from "@/lib/format";
import type { Auction } from "@/types/auction";

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    callback: (response: { error?: { description?: string } }) => void,
  ) => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
}

export default function AuctionPaymentButton({ auction }: { auction: Auction }) {
  const { user, loading: userLoading } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (auction.status !== "CLOSED" || userLoading || !user || user.role !== "BUYER") {
    return null;
  }

  async function loadCheckoutScript() {
    if (window.Razorpay) return;

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load Razorpay Checkout"));
      document.body.appendChild(script);
    });
  }

  async function handlePayment() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await loadCheckoutScript();
      const token = getAccessToken();
      if (!token) throw new Error("Please log in before paying");

      const order = await apiFetch<CreateOrderResponse>("/create-order", {
        method: "POST",
        token,
        body: JSON.stringify({
          amount: Math.round(auction.currentPrice * 100),
          currency: "INR",
          receipt: `auction_${auction.id}`,
        }),
      });

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: "HAMMR",
        description: auction.title,
        order_id: order.order_id,
        handler: async (response) => {
          try {
            await apiFetch("/verify-payment", {
              method: "POST",
              token,
              body: JSON.stringify(response),
            });
            setMessage("Payment verified successfully!");
          } catch (verificationError) {
            setError(
              verificationError instanceof ApiError
                ? verificationError.message
                : "Payment verification failed",
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage("Payment cancelled");
          },
        },
      });

      razorpay.on("payment.failed", (response) => {
        setLoading(false);
        setError(response.error?.description ?? "Payment failed");
      });
      razorpay.open();
    } catch (paymentError) {
      setLoading(false);
      setError(
        paymentError instanceof ApiError
          ? paymentError.message
          : paymentError instanceof Error
            ? paymentError.message
            : "Unable to start payment",
      );
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 p-6">
      <p className="text-xs text-gray-400">Winning amount</p>
      <p className="text-2xl font-bold text-gray-900">{formatMoney(auction.currentPrice)}</p>
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      {message && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Opening checkout..." : "Pay with Razorpay"}
      </button>
    </div>
  );
}
