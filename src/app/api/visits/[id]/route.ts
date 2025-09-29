// ~/app/api/visits/[id]/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "~/server/security/auth";
import { db } from "~/server/db";
import { visits } from "~/server/db/schema";
import { decryptFromB64, encryptToB64 } from "~/server/security/crypto";
import { eq } from "drizzle-orm";
import { writeAudit } from "~/server/audit/log";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { userId } = requireUser();
  const v = await db.query.visits.findFirst({
    where: eq(visits.id, params.id),
    with: { doctor: true, patient: true },
  });
  if (!v) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // TODO: enforce doctor ownership; simplified here
  const data = {
    ...v,
    transcript: v.transcriptEnc ? decryptFromB64(v.transcriptEnc) : "",
    structuredHistory: v.structuredHistoryEnc
      ? JSON.parse(decryptFromB64(v.structuredHistoryEnc))
      : null,
  };

  await writeAudit({
    actorClerkUserId: userId,
    doctorId: v.doctorId,
    patientId: v.patientId,
    visitId: v.id,
    action: "READ_VISIT",
  });

  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = requireUser();
  const body = await req.json();
  const encTranscript = body.transcript ? encryptToB64(body.transcript) : undefined;
  const encStructured = body.structuredHistory
    ? encryptToB64(JSON.stringify(body.structuredHistory))
    : undefined;

  await db
    .update(visits)
    .set({
      transcriptEnc: encTranscript,
      structuredHistoryEnc: encStructured,
      updatedAt: new Date(),
    })
    .where(eq(visits.id, params.id));

  await writeAudit({
    actorClerkUserId: userId,
    action: "UPDATE_VISIT",
    visitId: params.id,
  });

  return NextResponse.json({ ok: true });
}
