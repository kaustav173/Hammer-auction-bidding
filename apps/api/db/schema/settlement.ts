import { bigint, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { auctions } from "./auction.js";
import { users } from "./user.js";

export const settlementStatusEnum = pgEnum("settlement_status", [
  "PAYMENT_PENDING",
  "PAID",
  "PAYMENT_EXPIRED",
  "MOVED_TO_NEXT_BIDDER",
  "UNSOLD",
]);

export const auctionSettlements = pgTable("auction_settlements", {
  id: uuid("id").defaultRandom().primaryKey(),

  auctionId: uuid("auction_id")
    .notNull()
    .references(() => auctions.id, {
      onDelete: "restrict",
    }),

  winnerId: uuid("winner_id").references(() => users.id, {
    onDelete: "restrict",
  }),

  winningBidId: uuid("winning_bid_id"),

  amount: bigint("amount", {
    mode: "number",
  }),

  status: settlementStatusEnum("status").notNull(),

  paymentDeadline: timestamp("payment_deadline", {
    withTimezone: true,
  }),

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
