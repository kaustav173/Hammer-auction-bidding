import type { Response } from "express";
import { eq, sql } from "drizzle-orm";

import { db } from "../../db/index.js";
import { bids } from "../../db/schema/bid.js";
import { auctions } from "../../db/schema/auction.js";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

export async function placeBid(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const auctionId = Array.isArray(req.params.auctionId)
      ? req.params.auctionId[0]
      : req.params.auctionId;
    const amount = Number(req.body?.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid bid amount",
      });
    }

    const [auction] = await db.select().from(auctions).where(eq(auctions.id, auctionId)).limit(1);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    if (auction.status !== "LIVE") {
      return res.status(400).json({
        success: false,
        message: "Auction is not currently live",
      });
    }

    if (auction.sellerId === userId) {
      return res.status(400).json({
        success: false,
        message: "Sellers cannot bid on their own auctions",
      });
    }

    const minimumBid = Number(auction.currentPrice) + Number(auction.minimumIncrement);

    if (amount < minimumBid) {
      return res.status(400).json({
        success: false,
        message: `Bid must be at least ${minimumBid}`,
      });
    }

    const [newBid] = await db
      .insert(bids)
      .values({
        auctionId,
        bidderId: userId,
        amount: String(amount),
      })
      .returning();

    const [updatedAuction] = await db
      .update(auctions)
      .set({
        currentPrice: String(amount),
        bidCount: sql`${auctions.bidCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(auctions.id, auctionId))
      .returning({
        id: auctions.id,
        currentPrice: auctions.currentPrice,
        bidCount: auctions.bidCount,
        endAt: auctions.endAt,
      });

    return res.status(201).json({
      success: true,
      message: "Bid placed successfully",
      bid: {
        id: newBid.id,
        auctionId: newBid.auctionId,
        bidderId: newBid.bidderId,
        amount: Number(newBid.amount),
        createdAt: newBid.createdAt.toISOString(),
      },
      auction: {
        id: updatedAuction.id,
        currentPrice: Number(updatedAuction.currentPrice),
        bidCount: updatedAuction.bidCount,
        endAt: updatedAuction.endAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Place bid error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
