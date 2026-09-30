import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Stand-in for the real S3-compatible store: while S3_* env vars are blank,
// apps/api's UploadsService points uploads here instead. Files land under
// apps/web/public/uploads, which Next already serves statically — swapping
// in real S3 credentials later retires this route with no other changes.
//
// Access control lives upstream, at the presign step (apps/api's /uploads/presign
// is SUPER_ADMIN/ADMIN-only; /uploads/worker-photo-presign is deliberately public
// for worker self-registration) — a key here is only ever handed out by one of
// those. This route just needs the key to be well-formed, same trust level a
// real S3 presigned PUT URL would have.
const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

export async function PUT(req: NextRequest, ctx: { params: Promise<{ key: string[] }> }) {
  const { key } = await ctx.params;
  if (key.length === 0 || key.some((segment) => segment.includes("..") || /[/\\]/.test(segment))) {
    return NextResponse.json({ message: "Noto'g'ri fayl yo'li" }, { status: 400 });
  }

  const filePath = path.join(UPLOADS_ROOT, ...key);
  const buffer = Buffer.from(await req.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json({ message: "Bo'sh fayl yuborildi" }, { status: 400 });
  }

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);

  return NextResponse.json({ success: true });
}
