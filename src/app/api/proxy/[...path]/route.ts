// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_RENDER_API;

// Generate or reuse anonymous ID
function getOrCreateAnonId(request: NextRequest, res: NextResponse) {
  let anonId = request.cookies.get("anon-id")?.value;

  if (!anonId) {
    anonId = crypto.randomUUID();

    res.cookies.set("anon-id", anonId, {
      httpOnly: true,
      sameSite: "lax",
      secure: true, // important (Cloudflare = HTTPS)
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return anonId;
}

async function handleRequest(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname.replace("/api/proxy", "");
    const targetUrl = `${API_BASE_URL}${path}${request.nextUrl.search}`;

    // Create response early (for cookies)
    const res = new NextResponse();

    const anonId = getOrCreateAnonId(request, res);

    const headers = new Headers();

    headers.set("x-internal-secret", process.env.INTERNAL_PROXY_SECRET || "");

    headers.set("x-user-id", anonId);

    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
      cache: "no-store",
      duplex: "half",
    } as any);

    // ✅ CREATE new response with body + status
    const finalResponse = new NextResponse(response.body, {
      status: response.status,
    });

    // ✅ copy cookies from earlier response
    res.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie);
    });

    // ✅ preserve content-type
    finalResponse.headers.set(
      "Content-Type",
      response.headers.get("Content-Type") || "application/json",
    );

    return finalResponse;
  } catch (err) {
    console.error("Proxy Error:", err);
    return NextResponse.json({ error: "Proxy Error" }, { status: 502 });
  }
}

// Route handlers
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
