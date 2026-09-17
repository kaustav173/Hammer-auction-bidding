import { integer, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./user.js";

export const auctionStatusEnum = pgEnum("auction_status", [
  "SCHEDULED",
  "LIVE",
  "CLOSED",
  "SETTLEMENT_PENDING",
  "SOLD",
  "UNSOLD",
]);

export const auctions = pgTable("auctions", {
  id: uuid("id").defaultRandom().primaryKey(),

  sellerId: uuid("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: text("title").notNull(),

  description: text("description").notNull(),

  category: text("category").notNull(),

  startingPrice: numeric("starting_price", { precision: 12, scale: 2 }).notNull(),

  reservePrice: numeric("reserve_price", { precision: 12, scale: 2 }),

  currentPrice: numeric("current_price", { precision: 12, scale: 2 }).notNull(),

  minimumIncrement: numeric("minimum_increment", { precision: 12, scale: 2 }).notNull(),

  startAt: timestamp("start_at", { withTimezone: true }).notNull(),

  endAt: timestamp("end_at", { withTimezone: true }).notNull(),

  originalEndAt: timestamp("original_end_at", { withTimezone: true }).notNull(),

  maxEndAt: timestamp("max_end_at", { withTimezone: true }),

  status: auctionStatusEnum("status").notNull().default("SCHEDULED"),

  bidCount: integer("bid_count").notNull().default(0),

  viewCount: integer("view_count").notNull().default(0),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
