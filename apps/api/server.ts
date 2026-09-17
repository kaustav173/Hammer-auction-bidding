import "dotenv/config";

import app from "./app.js";
import { db } from "./db/index.js";
import { startAuctionScheduler } from "./modules/auction/auction.scheduler.js";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await db.execute("SELECT 1");

    console.log("✅ PostgreSQL connected");

    startAuctionScheduler();

    app.listen(PORT, () => {
      console.log(`🚀 Hammr API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);

    process.exit(1);
  }
}

startServer();
