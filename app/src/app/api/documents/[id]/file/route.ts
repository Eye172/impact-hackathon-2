import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const doc = await db.studentDocument.findUnique({ where: { id }, include: { profile: { select: { userId: true } } } });
  if (!doc || doc.profile.userId !== userId || !doc.content) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(doc.content), { headers: {
    "Content-Type": doc.mimeType || "application/octet-stream",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(doc.fileName)}`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  } });
}
