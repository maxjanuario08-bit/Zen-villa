import { NextResponse } from "next/server";
import { listOwnerAccounts } from "@/lib/owner-accounts";
import { adminRequestOk } from "@/lib/owner-admin";
import { logements } from "@/lib/logements";

export async function GET(req: Request) {
  if (!(await adminRequestOk(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const accounts = await listOwnerAccounts();
  return NextResponse.json({
    accounts,
    logements: logements.map((item) => ({ slug: item.slug, copyKey: item.copyKey })),
  });
}
