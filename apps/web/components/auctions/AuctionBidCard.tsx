"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { placeBid } from "@/lib/auction";
import { getAccessToken, useCurrentUser } from "@/lib/session";
import { formatMoney, formatTimeRemaining } from "@/lib/format";
import { ApiError } from "@/lib/api";
import type { Auction } from "@/types/auction";

export default function AuctionBidCard({ auction: initialAuction }: { auction: Auction }) {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const [auction, setAuction] = useState(initialAuction);
  const [timeLeft, setTimeLeft] = useState(formatTimeRemaining(initialAuction.endAt));
  const [amount, setAmount] = useState(
    String(initialAuction.currentPrice + initialAuction.minimumIncrement),
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const minimumBid = auction.currentPrice + auction.minimumIncrement;
  const reserveMet = auction.reservePrice === null || auction.currentPrice >= auction.reservePrice;
  const isOpenForBids = auction.status === "LIVE" && new Date(auction.endAt).getTime() > Date.now();

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(formatTimeRemaining(auction.endAt)), 1000);
    return () => clearInterval(interval);
  }, [auction.endAt]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const bidAmount = Number(amount);

    if (!Number.isFinite(bidAmount) || bidAmount < minimumBid) {
      setError(`Bid must be at least ${formatMoney(minimumBid)}`);
      return;
    }

    setLoading(true);

    try {
      const response = await placeBid(auction.id, bidAmount, token);

      setAuction((prev) => ({
        ...prev,
        currentPrice: response.auction.currentPrice,
        bidCount: response.auction.bidCount,
        endAt: response.auction.endAt,
      }));
      setAmount(String(response.auction.currentPrice + auction.minimumIncrement));
      setSuccess("Bid placed successfully!");
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        const details = err.details as { currentPrice?: number };

        if (typeof details.currentPrice === "number") {
          setAuction((prev) => ({ ...prev, currentPrice: details.currentPrice! }));
        }

        setError(
          typeof details.currentPrice === "number"
            ? `${err.message} — current price is now ${formatMoney(details.currentPrice)}`
            : err.message,
        );
      } else {
        setError(err instanceof Error ? err.message : "Unable to place bid");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-6">
      <p className="text-xs text-gray-400">Current bid</p>
      <p className="text-3xl font-bold text-gray-900">{formatMoney(auction.currentPrice)}</p>
      <p className="mt-1 text-sm text-gray-500">{auction.bidCount} bids so far</p>

      {auction.reservePrice !== null && (
        <p className="mt-1 text-xs text-gray-400">Reserve {reserveMet ? "met" : "not met"}</p>
      )}

      <div className="mt-4 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400">Time remaining</p>
        <p className="text-xl font-bold text-gray-900">{isOpenForBids ? timeLeft : auction.status}</p>
      </div>

      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {success && <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

      {!isOpenForBids ? (
        <p className="mt-4 text-sm text-gray-500">This auction isn&apos;t accepting bids right now.</p>
      ) : !userLoading && !user ? (
        <p className="mt-4 text-sm text-gray-500">
          <a href="/login" className="font-semibold text-gray-900 hover:underline">
            Log in
          </a>{" "}
          to place a bid.
        </p>
      ) : !userLoading && user?.role === "SELLER" ? (
        <p className="mt-4 text-sm text-gray-500">Sellers cannot bid on auctions.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="amount" className="mb-2 block text-sm font-medium text-gray-700">
              Your bid (minimum {formatMoney(minimumBid)})
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min={minimumBid}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Placing bid..." : "Place bid"}
          </button>
        </form>
      )}
    </div>
  );
}