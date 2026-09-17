export interface CreateAuctionInput {
  title: string;
  description: string;
  category: string;
  startingPrice: number;
  reservePrice: number | null;
  minimumIncrement: number;
  startAt: Date;
  endAt: Date;
  images: string[];
}
