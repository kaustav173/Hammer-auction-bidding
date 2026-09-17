export type AuctionStatus =
  | "SCHEDULED"
  | "LIVE"
  | "CLOSED"
  | "SETTLEMENT_PENDING"
  | "SOLD"
  | "UNSOLD";

export interface Auction {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  startingPrice: number;
  reservePrice: number | null;
  currentPrice: number;
  minimumIncrement: number;
  startAt: string;
  endAt: string;
  originalEndAt: string;
  maxEndAt: string | null;
  status: AuctionStatus;
  bidCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  createdAt: string;
}

export interface AuctionListResponse {
  success: boolean;
  auctions: Auction[];
}

export interface AuctionDetailResponse {
  success: boolean;
  auction: Auction;
}

export interface CreateAuctionResponse {
  success: boolean;
  message: string;
  auction: Auction;
}

export interface PlaceBidResponse {
  success: boolean;
  message: string;
  bid: Bid;
  auction: Pick<Auction, "id" | "currentPrice" | "bidCount" | "endAt">;
}

export interface CreateAuctionInput {
  title: string;
  description: string;
  category: string;
  startingPrice: number;
  reservePrice?: number;
  minimumIncrement: number;
  startAt: string;
  endAt: string;
  images?: string[];
}

export interface AuctionListFilters {
  status?: AuctionStatus;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}