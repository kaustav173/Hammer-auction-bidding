import { bigint, index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { auctions } from "./auction.js";
import { users } from "./user.js";

export const bids = pgTable(
  "bids",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    auctionId: uuid("auction_id")
      .notNull()
      .references(() => auctions.id, {
        onDelete: "restrict",
      }),

    bidderId: uuid("bidder_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),

    amount: bigint("amount", {
      mode: "number",
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    auctionCreatedIndex: index("bids_auction_created_idx").on(table.auctionId, table.createdAt),

    auctionAmountIndex: index("bids_auction_amount_idx").on(table.auctionId, table.amount),

    bidderIndex: index("bids_bidder_idx").on(table.bidderId),
  }),
);
