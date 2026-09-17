import { eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { auctions } from "../../db/schema/auction.js";
import { bids } from "../../db/schema/bid.js";
import { AppError } from "../../utils/app-error.js";
import { ANTI_SNIPING_WINDOW_MS, ANTI_SNIPING_EXTENSION_MS } from "./bids.constants.js";

export async function placeBid(auctionId: string, bidderId: string, amount: number) {
  return db.transaction(async (tx) => {
    // Section 22/49: lock the row first — every decision below reads post-lock state
    const [auction] = await tx
      .select()
      .from(auctions)
      .where(eq(auctions.id, auctionId))
      .for("update");

    if (!auction) {
      throw new AppError("Auction not found", 404);
    }

    if (auction.status !== "LIVE") {
      throw new AppError("Auction is not currently live", 409);
    }

    const now = new Date();

    // Section 14/35: authoritative time check, independent of any background worker
    if (now >= auction.endAt) {
      throw new AppError("Auction has ended", 409);
    }

    if (auction.sellerId === bidderId) {
      throw new AppError("Seller cannot bid on their own auction", 403);
    }

    // Section 28
    const minimumBid = auction.currentPrice + auction.minimumIncrement;

    if (amount < minimumBid) {
      throw new AppError("Bid is below the minimum required amount", 409, {
        currentPrice: auction.currentPrice,
        minimumBid,
      });
    }

    const [bid] = await tx.insert(bids).values({ auctionId, bidderId, amount }).returning();

    if (!bid) {
      throw new AppError("Unable to create bid", 500);
    }

    let newEndAt = auction.endAt;
    const msRemaining = auction.endAt.getTime() - now.getTime();

    if (msRemaining <= ANTI_SNIPING_WINDOW_MS) {
      const candidateEndAt = new Date(auction.endAt.getTime() + ANTI_SNIPING_EXTENSION_MS);
      newEndAt =
        auction.maxEndAt && candidateEndAt.getTime() > auction.maxEndAt.getTime()
          ? auction.maxEndAt
          : candidateEndAt;
    }

    const [updatedAuction] = await tx
      .update(auctions)
      .set({
        currentPrice: amount,
        bidCount: sql`${auctions.bidCount} + 1`,
        endAt: newEndAt,
        updatedAt: now,
      })
      .where(eq(auctions.id, auctionId))
      .returning();

    if (!updatedAuction) {
      throw new AppError("Failed to update auction after bid", 500);
    }

    return { bid, auction: updatedAuction };
  });
}
