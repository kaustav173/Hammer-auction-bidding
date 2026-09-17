import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { placeBid } from "./bid.service.js";
import { emitBidPlaced } from "./bids.events.js";
import { AppError } from "../../utils/app-error.js";

export async function createBid(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);

    const { auctionId } = req.params;
    const { amount } = req.body;

    const { bid, auction } = await placeBid(auctionId, req.user.userId, amount);

    emitBidPlaced(auction.id, {
      bid: { id: bid.id, amount: bid.amount },
      currentPrice: auction.currentPrice,
      bidCount: auction.bidCount,
      endAt: auction.endAt,
    });

    return res.status(201).json({
      success: true,
      message: "Bid placed successfully",
      bid,
      auction: {
        id: auction.id,
        currentPrice: auction.currentPrice,
        bidCount: auction.bidCount,
        endAt: auction.endAt,
      },
    });
  } catch (error) {
    next(error);
  }
}
