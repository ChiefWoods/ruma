import { NextRequest, NextResponse } from 'next/server';
import { privyClient } from './lib/privy';

const PUBLIC_PATHS = ['/', '/refresh', '/discover', '/events', '/users'];
const AUTHENTICATED_PATHS = ['/settings', '/create'];

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    searchParams.get('privy_oauth_code') ||
    searchParams.get('privy_oauth_state') ||
    searchParams.get('privy_oauth_provider')
    // || !AUTHENTICATED_PATHS.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  // const privyToken = req.cookies.get('privy-token');
  // const privySession = req.cookies.get('privy-session');

  // if (!privyToken) {
  //   return !privySession
  //     ? NextResponse.redirect(new URL('/', req.url))
  //     : NextResponse.redirect(
  //       new URL(`/refresh?redirect=${encodeURIComponent(pathname)}`, req.url)
  //     );
  // } else {
  //   try {
  //     await privyClient.verifyAuthToken(privyToken.value);
  //     return NextResponse.next();
  //   } catch (err) {
  //     console.error('Token verification failed:', err);

  //     const response = NextResponse.redirect(
  //       new URL(`/refresh?redirect=${encodeURIComponent(pathname)}`, req.url)
  //     );
  //     response.cookies.delete('privy-token');

  //     return response;
  //   }
  // }
}
