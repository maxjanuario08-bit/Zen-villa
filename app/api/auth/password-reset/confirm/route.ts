import { NextResponse } from "next/server";
import { accountRole } from "@/lib/password-credentials";
import { completePasswordReset } from "@/lib/password-reset";
import { clientIp, tooManyAuthAttempts, recordAuthAttempt } from "@/lib/owner-throttle";

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (await tooManyAuthAttempts(ip, "reset_confirm")) return NextResponse.json({ error: "limited" }, { status: 429 });
    await recordAuthAttempt(ip, "reset_confirm");
    const body = await req.json();
    const role = accountRole(body.role);
    if (!role || typeof body.token !== "string" || typeof body.password !== "string" || body.password !== body.confirm) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const ok = await completePasswordReset(role, body.token, body.password);
    return NextResponse.json(ok ? { ok: true } : { error: "invalid" }, { status: ok ? 200 : 400, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
