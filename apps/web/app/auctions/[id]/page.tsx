import { notFound } from "next/navigation";
import { getAuction } from "@/lib/auction";
import { ApiError } from "@/lib/api";
import AuctionBidCard from "@/components/auctions/AuctionBidCard";
import AuctionPaymentButton from "@/components/auctions/AuctionPaymentButton";

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let auction;
  try {
    ({ auction } = await getAuction(id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
        {auction.category}
      </span>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">{auction.title}</h1>
      <p className="mt-3 whitespace-pre-line text-gray-600">{auction.description}</p>

      <div className="mt-8 max-w-md">
        <AuctionBidCard auction={auction} />
        <AuctionPaymentButton auction={auction} />
      </div>
    </main>
  );
}
