import { NextRequest, NextResponse } from "next/server";

const TAPESTRY_API =
  process.env.NEXT_PUBLIC_TAPESTRY_API_URL ||
  "https://api.usetapestry.dev/api/v1";
const TAPESTRY_KEY = process.env.NEXT_PUBLIC_TAPESTRY_API_KEY || "";

/**
 * POST /api/tapestry
 *
 * Proxies Tapestry API calls server-side to avoid CORS.
 * Body: { endpoint: "/profiles/findOrCreate", method: "POST", body: {...} }
 */
export async function POST(req: NextRequest) {
  try {
    const { endpoint, method = "POST", body } = await req.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "Missing endpoint" },
        { status: 400 }
      );
    }

    const separator = endpoint.includes("?") ? "&" : "?";
    const url = `${TAPESTRY_API}${endpoint}${separator}apiKey=${TAPESTRY_KEY}`;

    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const text = await response.text();

    if (!response.ok) {
      console.error(`[Tapestry Proxy] ${response.status}: ${text}`);
      return NextResponse.json(
        { error: text },
        { status: response.status }
      );
    }

    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Tapestry Proxy] Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
