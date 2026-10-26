import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { accountRole } from "@/lib/password-credentials";
import { requestPasswordReset } from "@/lib/password-reset";
import { clientIp, tooManyAuthAttempts, recordAuthAttempt } from "@/lib/owner-throttle";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const role = accountRole(body.role);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!role || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const ip = clientIp(req);
    const mailbox = createHash("sha256").update(email).digest("hex");
    if (await tooManyAuthAttempts(ip, "reset", 10) || await tooManyAuthAttempts(mailbox, "reset_email", 3)) {
      return NextResponse.json({ error: "limited" }, { status: 429 });
    }
    await recordAuthAttempt(ip, "reset");
    await recordAuthAttempt(mailbox, "reset_email");
    const locale = body.locale === "en" || body.locale === "es" ? body.locale : "fr";
    await requestPasswordReset(role, email, locale);
    // Same answer whether or not this email has an account.
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
