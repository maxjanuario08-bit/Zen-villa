import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getCleaningById } from "@/lib/owner-data";
import { readCleaningPhotoToken } from "@/lib/owner-media";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = readCleaningPhotoToken(
    url.searchParams.get("c") ?? "",
    url.searchParams.get("i") ?? "",
    url.searchParams.get("e") ?? "",
    url.searchParams.get("s") ?? "",
  );
  if (!token) return new NextResponse("Not found", { status: 404 });

  const record = await getCleaningById(token.cleaningId);
  const src = record?.photos[token.index];
  if (!src || src.includes("..") || !src.startsWith("/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new NextResponse("Not found", { status: 404 });
    const buf = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
