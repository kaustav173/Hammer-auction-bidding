import { pgEnum, pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["BUYER", "SELLER", "ADMIN"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: text("email").notNull().unique(),

  passwordHash: text("password_hash").notNull(),

  role: userRoleEnum("role").notNull().default("BUYER"),

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
