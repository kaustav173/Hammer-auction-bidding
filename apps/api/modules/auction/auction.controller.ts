import type { Request, Response } from "express";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "../../db/index.js";
import { auctions } from "../../db/schema/auction.js";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

type AuctionStatus = "SCHEDULED" | "LIVE" | "CLOSED" | "SETTLEMENT_PENDING" | "SOLD" | "UNSOLD";

function formatAuction(row: typeof auctions.$inferSelect) {
  return {
    id: row.id,
    sellerId: row.sellerId,
    title: row.title,
    description: row.description,
    category: row.category,
    startingPrice: Number(row.startingPrice),
    reservePrice: row.reservePrice != null ? Number(row.reservePrice) : null,
    currentPrice: Number(row.currentPrice),
    minimumIncrement: Number(row.minimumIncrement),
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    originalEndAt: row.originalEndAt.toISOString(),
    maxEndAt: row.maxEndAt ? row.maxEndAt.toISOString() : null,
    status: row.status,
    bidCount: row.bidCount,
    viewCount: row.viewCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAuctions(req: Request, res: Response) {
  try {
    const { status, category, minPrice, maxPrice } = req.query as {
      status?: string;
      category?: string;
      minPrice?: string;
      maxPrice?: string;
    };

    const conditions = [];
    const minPriceValue = typeof minPrice === "string" ? minPrice : undefined;
    const maxPriceValue = typeof maxPrice === "string" ? maxPrice : undefined;

    if (status) {
      conditions.push(eq(auctions.status, status as AuctionStatus));
    }

    if (category) {
      conditions.push(eq(auctions.category, category));
    }

    if (minPriceValue !== undefined) {
      conditions.push(gte(auctions.currentPrice, minPriceValue));
    }

    if (maxPriceValue !== undefined) {
      conditions.push(lte(auctions.currentPrice, maxPriceValue));
    }

    const rows = await db
      .select()
      .from(auctions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auctions.createdAt));

    return res.status(200).json({
      success: true,
      auctions: rows.map(formatAuction),
    });
  } catch (error) {
    console.error("List auctions error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getAuction(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const [auction] = await db.select().from(auctions).where(eq(auctions.id, id)).limit(1);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Increment view count
    await db
      .update(auctions)
      .set({ viewCount: sql`${auctions.viewCount} + 1` })
      .where(eq(auctions.id, id));

    return res.status(200).json({
      success: true,
      auction: formatAuction({ ...auction, viewCount: auction.viewCount + 1 }),
    });
  } catch (error) {
    console.error("Get auction error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function listMyAuctions(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const rows = await db
      .select()
      .from(auctions)
      .where(eq(auctions.sellerId, userId))
      .orderBy(desc(auctions.createdAt));

    return res.status(200).json({
      success: true,
      auctions: rows.map(formatAuction),
    });
  } catch (error) {
    console.error("List my auctions error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function createAuction(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      title,
      description,
      category,
      startingPrice,
      reservePrice,
      minimumIncrement,
      startAt,
      endAt,
    } = req.body as {
      title: string;
      description: string;
      category: string;
      startingPrice: number;
      reservePrice?: number;
      minimumIncrement: number;
      startAt: string;
      endAt: string;
    };

    if (
      !title ||
      !description ||
      !category ||
      startingPrice == null ||
      minimumIncrement == null ||
      !startAt ||
      !endAt
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format for startAt or endAt",
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "endAt must be after startAt",
      });
    }

    const [newAuction] = await db
      .insert(auctions)
      .values({
        sellerId: userId,
        title,
        description,
        category,
        startingPrice: String(startingPrice),
        reservePrice: reservePrice != null ? String(reservePrice) : null,
        currentPrice: String(startingPrice),
        minimumIncrement: String(minimumIncrement),
        startAt: startDate,
        endAt: endDate,
        originalEndAt: endDate,
        status: "SCHEDULED",
      })
      .returning();

    if (!newAuction) {
      return res.status(500).json({
        success: false,
        message: "Failed to create auction",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Auction created successfully",
      auction: formatAuction(newAuction),
    });
  } catch (error) {
    console.error("Create auction error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
