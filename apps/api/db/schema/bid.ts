import { numeric, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./user.js";
import { auctions } from "./auction.js";

export const bids = pgTable("bids", {
  id: uuid("id").defaultRandom().primaryKey(),

  auctionId: uuid("auction_id")
    .notNull()
    .references(() => auctions.id, { onDelete: "cascade" }),

  bidderId: uuid("bidder_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
