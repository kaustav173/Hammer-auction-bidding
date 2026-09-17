import { apiFetch } from "./api";
import type {
  AuctionDetailResponse,
  AuctionListFilters,
  AuctionListResponse,
  CreateAuctionInput,
  CreateAuctionResponse,
  PlaceBidResponse,
} from "@/types/auction";

export async function listAuctions(filters: AuctionListFilters = {}): Promise<AuctionListResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));

  const query = params.toString();
  return apiFetch<AuctionListResponse>(`/auctions${query ? `?${query}` : ""}`);
}

export async function getAuction(id: string): Promise<AuctionDetailResponse> {
  return apiFetch<AuctionDetailResponse>(`/auctions/${id}`);
}

export async function listMyAuctions(token: string): Promise<AuctionListResponse> {
  return apiFetch<AuctionListResponse>("/auctions/mine", { token });
}

export async function createAuction(
  data: CreateAuctionInput,
  token: string,
): Promise<CreateAuctionResponse> {
  return apiFetch<CreateAuctionResponse>("/auctions", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function placeBid(
  auctionId: string,
  amount: number,
  token: string,
): Promise<PlaceBidResponse> {
  return apiFetch<PlaceBidResponse>(`/bids/${auctionId}`, {
    method: "POST",
    body: JSON.stringify({ amount }),
    token,
  });
}