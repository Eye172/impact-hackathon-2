import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const docId = formData.get("docId") as string | null;

  if (!file || !docId) {
    return Response.json({ error: "Missing file or docId" }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return Response.json({ error: "Максимальный размер документа — 4 МБ." }, { status: 413 });
  }

  // Verify the document belongs to this user
  const doc = await db.studentDocument.findUnique({
    where: { id: docId },
    include: { profile: { select: { userId: true } } },
  });
  if (!doc || doc.profile.userId !== userId) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  const bytes = await file.arrayBuffer();
  const url = `/api/documents/${docId}/file`;

  const updated = await db.studentDocument.update({
    where: { id: docId },
    data: {
      fileName: file.name,
      url,
      sizeBytes: file.size,
      content: Buffer.from(bytes),
      mimeType: file.type || "application/octet-stream",
      status: "uploaded",
    },
  });

  return Response.json({
    id: updated.id,
    kind: updated.kind,
    fileName: updated.fileName,
    url: updated.url,
    sizeBytes: updated.sizeBytes,
    status: updated.status,
    uploadedAt: updated.uploadedAt.toISOString(),
  });
}
