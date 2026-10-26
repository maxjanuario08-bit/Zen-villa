import { NextResponse } from 'next/server';
import { adminRequestOk } from '@/lib/owner-admin';
import { getSalesLibrary, mutateSalesLibrary, SalesLibraryError } from '@/lib/sales-library';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };
export async function GET(req: Request) {
  if (!(await adminRequestOk(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers });
  try { return NextResponse.json(await getSalesLibrary(), { headers }); }
  catch { return NextResponse.json({ error: 'sales_library_unavailable' }, { status: 500, headers }); }
}
export async function POST(req: Request) {
  if (!(await adminRequestOk(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers });
  // Reject browser cross-origin mutations while retaining existing bearer API access.
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin) return NextResponse.json({ error: 'invalid_origin' }, { status: 403, headers });
  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > 1_000_000) return NextResponse.json({ error: 'payload_too_large' }, { status: 400, headers });
    body = JSON.parse(text);
  } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400, headers }); }
  try { return NextResponse.json(await mutateSalesLibrary(body), { headers }); }
  catch (error) {
    if (error instanceof SalesLibraryError) return NextResponse.json({ error: error.message }, { status: error.status, headers });
    return NextResponse.json({ error: 'sales_library_unavailable' }, { status: 500, headers });
  }
}
