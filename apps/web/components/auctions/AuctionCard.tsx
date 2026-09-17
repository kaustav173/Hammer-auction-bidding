import Link from "next/link";
import type { Auction } from "@/types/auction";
import { formatMoney } from "@/lib/format";

export default function AuctionCard({ auction }: { auction: Auction }) {
  return (
    <Link
      href={`/auctions/${auction.id}`}
      className="block rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {auction.category}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            auction.status === "LIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {auction.status}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-gray-900">{auction.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{auction.description}</p>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-400">Current bid</p>
          <p className="text-xl font-bold text-gray-900">{formatMoney(auction.currentPrice)}</p>
        </div>
        <p className="text-xs text-gray-400">{auction.bidCount} bids</p>
      </div>
    </Link>
  );
}