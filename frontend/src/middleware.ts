import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['fa', 'en'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const pref = req.headers.get('accept-language')?.toLowerCase().startsWith('en') ? 'en' : 'fa';
  return NextResponse.redirect(new URL(`/${pref}${pathname === '/' ? '' : pathname}`, req.url));
}

export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
