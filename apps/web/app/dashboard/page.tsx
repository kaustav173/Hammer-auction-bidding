"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser, getAccessToken } from "@/lib/session";
import { listMyAuctions } from "@/lib/auction";
import type { Auction } from "@/types/auction";
import AuctionCard from "@/components/auctions/AuctionCard";
import TwoFactorSettings from "@/components/auth/TwoFactorSettings";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.role === "SELLER") {
      const token = getAccessToken();
      if (token) {
        listMyAuctions(token)
          .then((res) => setMyAuctions(res.auctions))
          .catch(() => setMyAuctions([]));
      }
    }
  }, [user]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.email}</h1>
      <p className="mt-1 text-sm text-gray-500">
        You&apos;re signed in as a {user.role.toLowerCase()}.
      </p>
      <TwoFactorSettings initiallyEnabled={user.twoFactorEnabled} />

      {user.role === "SELLER" ? (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Your auctions</h2>
            <Link
              href="/auctions/new"
              className="text-sm font-semibold text-gray-900 hover:underline"
            >
              + New auction
            </Link>
          </div>

          {myAuctions.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">You haven&apos;t listed anything yet.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="mt-10">
          <Link
            href="/auctions"
            className="inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Browse live auctions
          </Link>
        </section>
      )}
    </main>
  );
}
