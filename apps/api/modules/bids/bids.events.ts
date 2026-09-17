interface BidPlacedPayload {
  bid: { id: string; amount: number };
  currentPrice: number;
  bidCount: number;
  endAt: Date;
}

export function emitBidPlaced(auctionId: string, payload: BidPlacedPayload) {
  console.log(`[socket:stub] auction:${auctionId} -> auction:bid`, payload);
}
