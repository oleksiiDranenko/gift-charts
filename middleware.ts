import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  const botPattern = /bot|crawler|spider|crawling|python/i;
const allowedBots = /Googlebot|Bingbot|Slurp/i;

if (botPattern.test(ua) && !allowedBots.test(ua)) {
  return new Response('Blocked', { status: 403 });
}

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

