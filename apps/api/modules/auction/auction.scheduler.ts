import { and, eq, lte, gte, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { auctions } from "../../db/schema/auction.js";

async function tick() {
  const now = new Date();

  try {
    const activated = await db
      .update(auctions)
      .set({ status: "LIVE", updatedAt: now })
      .where(and(eq(auctions.status, "SCHEDULED"), lte(auctions.startAt, now)))
      .returning({ id: auctions.id });

    if (activated.length > 0) {
      console.log(
        `⏰ Activated ${activated.length} auction(s): ${activated.map((a) => a.id).join(", ")}`,
      );
    }

    const closed = await db
      .update(auctions)
      .set({ status: "CLOSED", updatedAt: now })
      .where(and(eq(auctions.status, "LIVE"), lte(auctions.endAt, now)))
      .returning({ id: auctions.id });

    if (closed.length > 0) {
      console.log(`⏰ Closed ${closed.length} auction(s): ${closed.map((a) => a.id).join(", ")}`);
    }
  } catch (error) {
    console.error("Auction scheduler tick error:", error);
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startAuctionScheduler(intervalMs = 30_000) {
  if (intervalId) return;
  console.log(`⏰ Auction scheduler started (every ${intervalMs / 1000}s)`);

  tick();
  intervalId = setInterval(tick, intervalMs);
}

export function stopAuctionScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
