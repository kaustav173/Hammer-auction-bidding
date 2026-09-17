import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import {
  createAuction,
  getAuctionById,
  listAuctions,
  listSellerAuctions,
} from "./auction.service.js";
import { AppError } from "../../utils/app-error.js";

export async function createAuctionHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);
    const auction = await createAuction(req.user.userId, req.body);
    return res
      .status(201)
      .json({ success: true, message: "Auction created successfully", auction });
  } catch (error) {
    next(error);
  }
}

export async function getAuctionHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const auction = await getAuctionById(req.params.id);
    if (!auction) throw new AppError("Auction not found", 404);
    return res.status(200).json({ success: true, auction });
  } catch (error) {
    next(error);
  }
}

export async function listAuctionsHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status, category, minPrice, maxPrice } = req.query;
    const parsedMinPrice = minPrice !== undefined ? Number(minPrice) : undefined;
    const parsedMaxPrice = maxPrice !== undefined ? Number(maxPrice) : undefined;

    if (parsedMinPrice !== undefined && !Number.isFinite(parsedMinPrice)) {
      return res.status(400).json({ success: false, message: "minPrice must be a valid number" });
    }
    if (parsedMaxPrice !== undefined && !Number.isFinite(parsedMaxPrice)) {
      return res.status(400).json({ success: false, message: "maxPrice must be a valid number" });
    }

    const result = await listAuctions({
      status: typeof status === "string" ? status : undefined,
      category: typeof category === "string" ? category : undefined,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
    });
    return res.status(200).json({ success: true, auctions: result });
  } catch (error) {
    next(error);
  }
}

export async function listMyAuctionsHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);
    const result = await listSellerAuctions(req.user.userId);
    return res.status(200).json({ success: true, auctions: result });
  } catch (error) {
    next(error);
  }
}
