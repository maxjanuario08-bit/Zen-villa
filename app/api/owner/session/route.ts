import { NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/owner-auth";

export async function GET() {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ user: null });
  return NextResponse.json({ user: session });
}
