import AuctionCard from "@/components/auctions/AuctionCard";
import { listAuctions } from "@/lib/auction";
import type { AuctionStatus } from "@/types/auction";

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>;
}) {
  const { status, category } = await searchParams;

  const { auctions } = await listAuctions({
    status: (status as AuctionStatus | undefined) ?? "LIVE",
    category,
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Live auctions</h1>
        <p className="mt-1 text-sm text-gray-500">
          {auctions.length} auction{auctions.length === 1 ? "" : "s"} live right now
        </p>
      </div>

      {auctions.length === 0 ? (
        <p className="text-sm text-gray-500">No auctions match right now — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </main>
  );
}