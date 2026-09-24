import { NextResponse } from "next/server";
import { createOwnerAccount } from "@/lib/owner-accounts";
import {
  OWNER_COOKIE,
  createOwnerToken,
  isDemoOwnerEmail,
  ownerAuthConfigured,
  ownerCookieOptions,
} from "@/lib/owner-auth";
import { clientIp, recordAuthAttempt, tooManyAuthAttempts } from "@/lib/owner-throttle";

export async function POST(req: Request) {
  if (!ownerAuthConfigured()) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }

  const ip = clientIp(req);
  if (await tooManyAuthAttempts(ip, "register")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { email?: string; name?: string; password?: string; propertyNote?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const name = String(body.name ?? "").trim();
  const password = String(body.password ?? "");
  const propertyNote = String(body.propertyNote ?? "");

  if (!email.includes("@") || name.length < 2) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (isDemoOwnerEmail(email)) {
    return NextResponse.json({ error: "exists" }, { status: 409 });
  }

  await recordAuthAttempt(ip, "register");
  const created = await createOwnerAccount({ email, name, password, propertyNote });
  if ("error" in created) {
    const status = created.error === "exists" ? 409 : 400;
    return NextResponse.json({ error: created.error }, { status });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    OWNER_COOKIE,
    createOwnerToken({
      email: created.email,
      name: created.name,
      logements: created.logements,
    }),
    ownerCookieOptions(),
  );
  return res;
}
