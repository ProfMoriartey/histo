import { NextResponse } from "next/server";
import { requireUser } from "~/server/security/auth";
import { db } from "~/server/db";
import { patients } from "~/server/db/schema";
import { CreatePatientInput } from "~/lib/validation";
import { encryptToB64 } from "~/server/security/crypto";
import { writeAudit } from "~/server/audit/log";

export async function POST(req: Request) {
  try {
    const { doctor, userId } = await requireUser();
    const body = await req.json();
    const input = CreatePatientInput.parse(body);

    const [p] = await db
      .insert(patients)
      .values({
        doctorId: doctor.id,
        firstNameEnc: encryptToB64(input.firstName),
        lastNameEnc: encryptToB64(input.lastName),
        dobEnc: encryptToB64(input.dob),
        sexEnc: encryptToB64(input.sex),
        mrnEnc: encryptToB64(input.mrn),
        phoneEnc: input.phone ? encryptToB64(input.phone) : null,
        emailEnc: input.email ? encryptToB64(input.email) : null,
      })
      .returning();

    if (!p) return NextResponse.json({ error: "Insert failed" }, { status: 500 });

    await writeAudit({
      actorClerkUserId: userId,
      doctorId: doctor.id,
      patientId: p.id,
      action: "CREATE_PATIENT",
    });

    return NextResponse.json({ patientId: p.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
