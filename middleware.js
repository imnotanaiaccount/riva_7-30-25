import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  
  // Set CSP header
  const csp = [
    "default-src 'self';",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://assets.calendly.com https://www.chatbase.co https://vercel.live https://*.stripe.com;",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com data:;",
    "img-src 'self' data: blob: https://grainy-gradients.vercel.app https://*.stripe.com https://assets.calendly.com https://www.chatbase.co https://backend.chatbase.co https://vercel.live;",
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:;",
    "connect-src 'self' https://*.stripe.com https://*.calendly.com https://*.chatbase.co https://*.supabase.co https://vercel.live;",
    "frame-src 'self' https://js.stripe.com https://assets.calendly.com https://*.stripe.com https://vercel.live https://www.chatbase.co;",
    "media-src 'self' https://*.stripe.com;",
    "object-src 'none';",
    "base-uri 'self';",
    "form-action 'self' https://*.stripe.com;",
    "frame-ancestors 'self';"
  ].join(' ');

  // Set security headers
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return response;
}

// Apply to all routes
export const config = {
  matcher: '/:path*',
};