import { NextResponse } from "next/server";
import { adminRequestOk } from "@/lib/owner-admin";
import { getAllCleanings, getAllShifts, getAllStays } from "@/lib/owner-data";

export async function GET(req: Request) {
  if (!(await adminRequestOk(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [stays, cleanings, shifts] = await Promise.all([getAllStays(), getAllCleanings(), getAllShifts()]);
  return NextResponse.json({ stays, cleanings, shifts });
}
