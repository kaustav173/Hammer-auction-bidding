import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { auctions } from "./auction.js";

export const auctionImages = pgTable("auction_images", {
  id: uuid("id").defaultRandom().primaryKey(),

  auctionId: uuid("auction_id")
    .notNull()
    .references(() => auctions.id, {
      onDelete: "cascade",
    }),

  url: text("url").notNull(),

  position: integer("position").notNull().default(0),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});
