import { NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/owner-auth";
import { isOpsSession } from "@/lib/owner-ops-auth";
import { uploadAbsPath, uploadFileName } from "@/lib/photo-store";
import { readFile, stat } from "fs/promises";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const name = uploadFileName(file);
  if (!name) return new NextResponse("Not found", { status: 404 });
  if (!(await isOpsSession()) && !(await getOwnerSession())) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const abs = uploadAbsPath(name);
    const info = await stat(abs);
    if (!info.isFile()) return new NextResponse("Not found", { status: 404 });
    const buf = await readFile(abs);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
