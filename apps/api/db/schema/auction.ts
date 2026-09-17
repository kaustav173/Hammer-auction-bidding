import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
    .references(() => users.id, {
      onDelete: "restrict",
    }),

  title: text("title").notNull(),

  description: text("description").notNull(),

  category: text("category").notNull(),

  startingPrice: integer("starting_price").notNull(),

  reservePrice: integer("reserve_price"),

  currentPrice: integer("current_price").notNull(),

  minimumIncrement: integer("minimum_increment").notNull().default(100),

  startAt: timestamp("start_at", {
    withTimezone: true,
  }).notNull(),

  endAt: timestamp("end_at", {
    withTimezone: true,
  }).notNull(),

  originalEndAt: timestamp("original_end_at", {
    withTimezone: true,
  }).notNull(),

  maxEndAt: timestamp("max_end_at", {
    withTimezone: true,
  }),

  status: auctionStatusEnum("status").notNull().default("SCHEDULED"),

  bidCount: integer("bid_count").notNull().default(0),

  viewCount: integer("view_count").notNull().default(0),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});
