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
      body = await request.arrayBuffer();
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
        "Set-Cookie": response.headers.get("Set-Cookie") || "",
      },
    });
  } catch (err) {
    console.error("Proxy Error:", err);
    return NextResponse.json({ error: "Proxy Error" }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
