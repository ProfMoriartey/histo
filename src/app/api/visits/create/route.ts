// ~/app/api/visits/create/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "~/server/security/auth";
import { db } from "~/server/db";
import { patients, visits } from "~/server/db/schema";
import { encryptToB64 } from "~/server/security/crypto";
import { runWhisperFromUrl, extractHistoryWithGPT } from "~/server/ai/transcribeAndExtract";
import { eq, and } from "drizzle-orm";
import { writeAudit } from "~/server/audit/log";

export async function POST(req: Request) {
  try {
    const { userId } = await requireUser();
    const { patientId, audioUrl, transcriptOverride } = await req.json();

    // Verify patient belongs to doctor
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, patientId),
      with: { doctor: true },
    });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const doctor = patient.doctor;
    // Lookup doctor row by clerk user id
    // (You should ensure a doctors row exists per user at signup)
    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    // Transcribe (or use override)
    const transcript = transcriptOverride ?? (await runWhisperFromUrl(audioUrl));

    // Extract structured history
    const structured = await extractHistoryWithGPT(transcript);

    // Save visit
   const created = await db
  .insert(visits)
  .values({
    patientId,
    doctorId: doctor.id,
    audioUrl,
    transcriptEnc: encryptToB64(transcript),
    structuredHistoryEnc: encryptToB64(JSON.stringify(structured)),
  })
  .returning();

const v = created[0];
if (!v) {
  return NextResponse.json({ error: "Failed to create visit" }, { status: 500 });
}

await writeAudit({
  actorClerkUserId: userId,
  doctorId: doctor.id,
  patientId,
  visitId: v.id,
  action: "CREATE_VISIT",
});

return NextResponse.json({ visitId: v.id }, { status: 201 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
