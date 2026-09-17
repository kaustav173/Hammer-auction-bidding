DROP TABLE "auction_images";--> statement-breakpoint
DROP INDEX "bids_auction_created_idx";--> statement-breakpoint
DROP INDEX "bids_auction_amount_idx";--> statement-breakpoint
DROP INDEX "bids_bidder_idx";--> statement-breakpoint
ALTER TABLE "auctions" ALTER COLUMN "starting_price" SET DATA TYPE numeric(12,2) USING "starting_price"::numeric(12,2);--> statement-breakpoint
ALTER TABLE "auctions" ALTER COLUMN "reserve_price" SET DATA TYPE numeric(12,2) USING "reserve_price"::numeric(12,2);--> statement-breakpoint
ALTER TABLE "auctions" ALTER COLUMN "current_price" SET DATA TYPE numeric(12,2) USING "current_price"::numeric(12,2);--> statement-breakpoint
ALTER TABLE "auctions" ALTER COLUMN "minimum_increment" SET DATA TYPE numeric(12,2) USING "minimum_increment"::numeric(12,2);--> statement-breakpoint
ALTER TABLE "auctions" ALTER COLUMN "minimum_increment" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "bids" ALTER COLUMN "amount" SET DATA TYPE numeric(12,2) USING "amount"::numeric(12,2);--> statement-breakpoint
ALTER TABLE "auctions" DROP CONSTRAINT "auctions_seller_id_users_id_fkey", ADD CONSTRAINT "auctions_seller_id_users_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bids" DROP CONSTRAINT "bids_auction_id_auctions_id_fkey", ADD CONSTRAINT "bids_auction_id_auctions_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bids" DROP CONSTRAINT "bids_bidder_id_users_id_fkey", ADD CONSTRAINT "bids_bidder_id_users_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE CASCADE;