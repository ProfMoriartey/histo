// ~/app/visits/[id]/page.tsx
import { notFound } from "next/navigation";
import { decryptFromB64 } from "~/server/security/crypto";
import { db } from "~/server/db";
import { visits } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "~/components/ui/button";

export default async function VisitPage({
  params,
}: {
  params: { id: string };
}) {
  const v = await db.query.visits.findFirst({
    where: eq(visits.id, params.id),
  });
  if (!v) return notFound();

  const structured = v.structuredHistoryEnc
    ? JSON.parse(decryptFromB64(v.structuredHistoryEnc))
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Review Patient History</h1>
      {/* Render editable fields (for brevity show one) */}
      {/* In practice: controlled inputs with a form library */}
      <form action={`/api/visits/${v.id}`} method="POST">
        {/* Use a client component for interactive editing and PATCH via fetch */}
        <pre className="bg-muted overflow-auto rounded p-4 text-sm">
          {JSON.stringify(structured, null, 2)}
        </pre>
      </form>

      <div className="flex gap-3">
        <a
          className="inline-block"
          href={`/api/export/${v.id}`}
          target="_blank"
        >
          <Button>Export as PDF</Button>
        </a>
      </div>
    </div>
  );
}
