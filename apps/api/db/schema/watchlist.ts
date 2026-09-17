import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { auctions } from "./auction.js";
import { users } from "./user.js";

export const auctionWatchlist = pgTable(
  "auction_watchlist",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    auctionId: uuid("auction_id")
      .notNull()
      .references(() => auctions.id, {
        onDelete: "cascade",
      }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userAuctionUnique: unique("watchlist_user_auction_unique").on(table.userId, table.auctionId),
  }),
);
