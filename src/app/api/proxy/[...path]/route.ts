// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_RENDER_API;

// We'll add the secret later — for now just basic proxy
export async function GET(request: NextRequest) {
  return handleRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return handleRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, "PUT");
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, "PATCH");
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, "DELETE");
}

async function handleRequest(request: NextRequest, method: string) {
  try {
    const path = request.nextUrl.pathname.replace("/api/proxy", "");
    const targetUrl = `${API_BASE_URL}${path}${request.nextUrl.search}`;
    const headers = new Headers(request.headers);

    headers.delete("host");
    headers.delete("connection");
    headers.delete("referer");
    headers.set("x-internal-secret", process.env.INTERNAL_PROXY_SECRET || "");

    let body: any = undefined;
    if (method !== "GET" && method !== "HEAD") {
      const rawBody = await request.arrayBuffer();
      body = Buffer.from(rawBody);
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "follow",
    });

    const proxyHeaders = new Headers();
    // Ensure you keep the boundary in the content-type for multipart
    ["content-type", "content-disposition", "set-cookie"].forEach((key) => {
      const value = response.headers.get(key);
      if (value) proxyHeaders.set(key, value);
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: proxyHeaders,
    });
  } catch (err) {
    return NextResponse.json({ error: "Proxy Error" }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
