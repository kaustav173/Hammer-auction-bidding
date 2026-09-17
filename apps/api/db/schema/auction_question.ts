import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { auctions } from "./auction.js";
import { users } from "./user.js";

export const auctionQuestions = pgTable("auction_questions", {
  id: uuid("id").defaultRandom().primaryKey(),

  auctionId: uuid("auction_id")
    .notNull()
    .references(() => auctions.id, {
      onDelete: "cascade",
    }),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "restrict",
    }),

  question: text("question").notNull(),

  answer: text("answer"),

  answeredAt: timestamp("answered_at", {
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
