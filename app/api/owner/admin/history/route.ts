import { NextResponse } from "next/server";
import { adminRequestOk } from "@/lib/owner-admin";
import { getAllCleanings, getAllStays } from "@/lib/owner-data";

export async function GET(req: Request) {
  if (!(await adminRequestOk(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [stays, cleanings] = await Promise.all([getAllStays(), getAllCleanings()]);
  return NextResponse.json({ stays, cleanings });
}
