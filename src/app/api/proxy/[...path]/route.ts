// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_RENDER_API;

async function handleRequest(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname.replace("/api/proxy", "");
    const targetUrl = `${API_BASE_URL}${path}${request.nextUrl.search}`;

    // 1. Prepare headers
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("connection");
    headers.delete("referer");
    headers.set("x-internal-secret", process.env.INTERNAL_PROXY_SECRET || "");

    // 2. Proxy the request using the raw request body stream
    // This prevents corruption because we never 'touch' the binary data
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body // PASS THE RAW STREAM DIRECTLY
          : undefined,
      cache: "no-store",
      // Important for Amplify: tell fetch not to try and decompress
      // so the binary stays original
      duplex: "half",
    } as any);

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    console.error("Proxy Error:", err);
    return NextResponse.json({ error: "Proxy Error" }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(req);
}
export async function POST(req: NextRequest) {
  return handleRequest(req);
}
export async function PUT(req: NextRequest) {
  return handleRequest(req);
}
export async function PATCH(req: NextRequest) {
  return handleRequest(req);
}
export async function DELETE(req: NextRequest) {
  return handleRequest(req);
}

export const dynamic = "force-dynamic";
