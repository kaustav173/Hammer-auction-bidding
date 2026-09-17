CREATE TYPE "auction_status" AS ENUM('SCHEDULED', 'LIVE', 'CLOSED', 'SETTLEMENT_PENDING', 'SOLD', 'UNSOLD');--> statement-breakpoint
CREATE TABLE "auctions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"seller_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"starting_price" integer NOT NULL,
	"reserve_price" integer,
	"current_price" integer NOT NULL,
	"minimum_increment" integer DEFAULT 100 NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"original_end_at" timestamp with time zone NOT NULL,
	"max_end_at" timestamp with time zone,
	"status" "auction_status" DEFAULT 'SCHEDULED'::"auction_status" NOT NULL,
	"bid_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auction_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"auction_id" uuid NOT NULL,
	"url" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"auction_id" uuid NOT NULL,
	"bidder_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "bids_auction_created_idx" ON "bids" ("auction_id","created_at");--> statement-breakpoint
CREATE INDEX "bids_auction_amount_idx" ON "bids" ("auction_id","amount");--> statement-breakpoint
CREATE INDEX "bids_bidder_idx" ON "bids" ("bidder_id");--> statement-breakpoint
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_seller_id_users_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "auction_images" ADD CONSTRAINT "auction_images_auction_id_auctions_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_auction_id_auctions_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidder_id_users_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE RESTRICT;