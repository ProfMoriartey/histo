// ~/app/api/export/[visitId]/route.tsx
import { NextResponse } from "next/server";
import { requireUser } from "~/server/security/auth";
import { db } from "~/server/db";
import { visits } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { decryptFromB64 } from "~/server/security/crypto";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { PDFDoc } from "~/server/pdf/PDFDoc";
import { writeAudit } from "~/server/audit/log";

export async function GET(
  _: Request,
  { params }: { params: { visitId: string } },
) {
  const { userId } = requireUser();
  const v = await db.query.visits.findFirst({
    where: eq(visits.id, params.visitId),
    with: { patient: true, doctor: true },
  });
  if (!v) return new NextResponse("Not found", { status: 404 });

  const structured = v.structuredHistoryEnc
    ? JSON.parse(decryptFromB64(v.structuredHistoryEnc))
    : null;
  const patient = v.patient;
  const doctor = v.doctor;

  await writeAudit({
    actorClerkUserId: userId,
    action: "EXPORT_PDF",
    doctorId: doctor?.id,
    patientId: patient?.id,
    visitId: v.id,
  });

  const stream = await renderToStream(
    React.createElement(PDFDoc, { doctor, patient, structured, visit: v }),
  );

  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="visit-${v.id}.pdf"`,
    },
  });
}
