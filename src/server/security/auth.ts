// src/server/security/auth.ts
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { doctors } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

type Doctor = InferSelectModel<typeof doctors>;

export async function requireUser(): Promise<{
  userId: string;
  sessionId: string;
  doctor: Doctor;
}> {
  const { userId, sessionId } = await auth();
  if (!userId || !sessionId) {
    throw new Error("Unauthorized");
  }

  let doctor = await db.query.doctors.findFirst({
    where: eq(doctors.clerkUserId, userId),
  });

  if (!doctor) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const [created] = await db
      .insert(doctors)
      .values({
        clerkUserId: userId,
        email: user.emailAddresses[0]?.emailAddress ?? "unknown@example.com",
        name: user.firstName
          ? `${user.firstName} ${user.lastName ?? ""}`
          : "Unnamed Doctor",
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create doctor record");
    }

    doctor = created;
  }

  // ✅ Here doctor is guaranteed non-undefined
  return { userId, sessionId, doctor };
}
