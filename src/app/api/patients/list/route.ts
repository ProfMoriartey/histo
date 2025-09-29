import { NextResponse } from "next/server";
import { requireUser } from "~/server/security/auth";
import { db } from "~/server/db";
import { patients } from "~/server/db/schema";
import { decryptFromB64 } from "~/server/security/crypto";
import { eq } from "drizzle-orm";

export async function GET() {
  const { doctor, userId } = await requireUser();

  const list = await db.query.patients.findMany({
    where: eq(patients.doctorId, doctor.id),
  });

  const decrypted = list.map((p) => ({
    id: p.id,
    firstName: decryptFromB64(p.firstNameEnc),
    lastName: decryptFromB64(p.lastNameEnc),
    dob: decryptFromB64(p.dobEnc),
    sex: decryptFromB64(p.sexEnc),
    mrn: decryptFromB64(p.mrnEnc),
  }));

  return NextResponse.json(decrypted);
}
