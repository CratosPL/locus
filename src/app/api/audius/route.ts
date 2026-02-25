import { NextRequest, NextResponse } from "next/server";

// Server-side proxy for Audius search — avoids CORS issues in the browser.
// Tries multiple discovery nodes in order until one responds.

const DISCOVERY_NODES = [
  "https://discoveryprovider.audius.co",
  "https://discoveryprovider2.audius.co",
  "https://discoveryprovider3.audius.co",
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const limit = searchParams.get("limit") || "6";

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ data: [] });
  }

  const path = `/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=LOCUS&limit=${limit}`;

  for (const node of DISCOVERY_NODES) {
    try {
      const res = await fetch(node + path, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue;
      const json = await res.json();
      return NextResponse.json(json);
    } catch {
      // try next node
    }
  }

  return NextResponse.json({ data: [] }, { status: 502 });
}
