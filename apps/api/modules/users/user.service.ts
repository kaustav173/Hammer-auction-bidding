import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/user.js";
import type { UpdateUserBody } from "./user.types.js";

export async function updateUser(userId: string, data: UpdateUserBody) {
  const [updatedUser] = await db
    .update(users)
    .set({
      ...(data.email && { email: data.email }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return updatedUser ?? null;
}

export async function deleteUser(userId: string) {
  const [deletedUser] = await db.delete(users).where(eq(users.id, userId)).returning({
    id: users.id,
  });

  return deletedUser ?? null;
}
