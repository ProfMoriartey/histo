// ~/server/audit/log.ts
import { db } from "~/server/db";
import { auditLogs } from "~/server/db/schema";
import { headers } from "next/headers";

type Audit = {
  actorClerkUserId: string;
  doctorId?: string;
  patientId?: string;
  visitId?: string;
  action: string;
};

export async function writeAudit(entry: Audit) {
  const h = headers();
  await db.insert(auditLogs).values({
    ...entry,
    ip: (await h).get("x-forwarded-for") ?? undefined,
    ua: (await h).get("user-agent") ?? undefined,
  });
}
