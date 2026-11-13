import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/owner-admin";
import { AssistantProviderError, askCommercialAssistant, readCommercialBrief } from "@/lib/admin-assistant";

export const maxDuration = 40;
const headers = { "Cache-Control": "private, no-store" };
const lastRequest = new Map<string, number>();

function reply(data: object, status = 200) {
  return NextResponse.json(data, { status, headers });
}

export async function GET() {
  if (!(await getAdminSession())) return reply({ error: "unauthorized" }, 401);
  return reply(await readCommercialBrief());
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return reply({ error: "unauthorized" }, 401);
  if (req.headers.get("origin") !== new URL(req.url).origin) return reply({ error: "origin" }, 403);
  const body = await req.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question || question.length > 1600) return reply({ error: "invalid" }, 400);
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return reply({ error: "not_configured" }, 503);
  const now = Date.now();
  if (now - (lastRequest.get(session.email) ?? 0) < 5000) return reply({ error: "rate_limit" }, 429);
  lastRequest.set(session.email, now);
  try {
    return reply({ answer: await askCommercialAssistant(question, key, req.headers.get("x-vercel-oidc-token")) });
  } catch (error) {
    const reason = error instanceof AssistantProviderError ? error.reason
      : error instanceof Error && error.name === "TimeoutError" ? "timeout"
      : "unavailable";
    console.warn("Commercial assistant request failed", {
      reason, upstreamStatus: error instanceof AssistantProviderError ? error.status : undefined,
    });
    return reply({ error: "provider_unavailable", reason }, 502);
  }
}
