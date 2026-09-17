export interface UpdateUserBody {
  email?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}
