import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

export async function saveJpegFromDataUrl(dataUrl: string): Promise<string | null> {
  const match = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);
  if (!match) return null;
  const buf = Buffer.from(match[2], "base64");
  if (buf.length < 80 || buf.length > 450_000) return null;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${randomBytes(12).toString("hex")}.jpg`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return `/api/owner/uploads/${name}`;
}

export async function persistPhotoList(photos: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const item of photos.slice(0, 8)) {
    if (item.startsWith("data:image/")) {
      const stored = await saveJpegFromDataUrl(item);
      if (stored) out.push(stored);
    } else if (item.startsWith("/api/owner/uploads/") || item.startsWith("/logements/")) {
      out.push(item);
    }
  }
  return out;
}

export function uploadFileName(raw: string) {
  const name = raw.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!/^[a-f0-9]{24}\.(jpg|jpeg|png|webp)$/i.test(name)) return null;
  return name;
}

export function uploadAbsPath(name: string) {
  return path.join(UPLOAD_DIR, name);
}
