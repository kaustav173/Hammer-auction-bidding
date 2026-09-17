import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "../../db/index.js";
import { auctions } from "../../db/schema/auction.js";
import { auctionImages } from "../../db/schema/auction_image.js";
import { AppError } from "../../utils/app-error.js";
import { MAX_TOTAL_EXTENSION_MS } from "../bids/bids.constants.js";
import type { CreateAuctionInput } from "./auction.types.js";

export async function createAuction(sellerId: string, data: CreateAuctionInput) {
  return db.transaction(async (tx) => {
    const maxEndAt = new Date(data.endAt.getTime() + MAX_TOTAL_EXTENSION_MS); // Section 33

    const [auction] = await tx
      .insert(auctions)
      .values({
        sellerId,
        title: data.title,
        description: data.description,
        category: data.category,
        startingPrice: data.startingPrice,
        reservePrice: data.reservePrice,
        currentPrice: data.startingPrice,
        minimumIncrement: data.minimumIncrement,
        startAt: data.startAt,
        endAt: data.endAt,
        originalEndAt: data.endAt,
        maxEndAt,
        status: "SCHEDULED",
      })
      .returning();

    if (!auction) throw new AppError("Unable to create auction", 500);

    if (data.images.length > 0) {
      await tx
        .insert(auctionImages)
        .values(data.images.map((url, position) => ({ auctionId: auction.id, url, position })));
    }

    return auction;
  });
}

export async function getAuctionById(id: string) {
  const [auction] = await db.select().from(auctions).where(eq(auctions.id, id)).limit(1);
  return auction ?? null;
}

export async function listSellerAuctions(sellerId: string) {
  return db.select().from(auctions).where(eq(auctions.sellerId, sellerId));
}

export async function listAuctions(filters: {
  status?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const conditions = [];
  if (filters.status)
    conditions.push(eq(auctions.status, filters.status as (typeof auctions.status)["_"]["data"]));
  if (filters.category) conditions.push(eq(auctions.category, filters.category));
  if (filters.minPrice !== undefined) conditions.push(gte(auctions.currentPrice, filters.minPrice));
  if (filters.maxPrice !== undefined) conditions.push(lte(auctions.currentPrice, filters.maxPrice));

  const query = db.select().from(auctions);
  return conditions.length > 0 ? query.where(and(...conditions)) : query;
}
