import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { placeBid } from "./bid.service.js";
import { emitBidPlaced } from "./bids.events.js";
import { AppError } from "../../utils/app-error.js";

export async function createBid(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);

    const auctionId = Array.isArray(req.params.auctionId)
      ? req.params.auctionId[0]
      : req.params.auctionId;
    const amount = Number(req.body?.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new AppError("Invalid bid amount", 400);
    }

    const { bid, auction } = await placeBid(auctionId, req.user.userId, amount);

    emitBidPlaced(auction.id, {
      bid: { id: bid.id, amount: Number(bid.amount) },
      currentPrice: auction.currentPrice,
      bidCount: auction.bidCount,
      endAt: auction.endAt,
    });

    return res.status(201).json({
      success: true,
      message: "Bid placed successfully",
      bid: {
        ...bid,
        amount: Number(bid.amount),
      },
      auction: {
        id: auction.id,
        currentPrice: Number(auction.currentPrice),
        bidCount: auction.bidCount,
        endAt: auction.endAt,
      },
    });
  } catch (error) {
    next(error);
  }
}
