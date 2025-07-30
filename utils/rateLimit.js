import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new ratelimiter, that allows 10 requests per 60 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

export default async function rateLimitMiddleware(req, res) {
  const identifier = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const result = await ratelimit.limit(identifier);
  
  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  
  if (!result.success) {
    return new Response(
      JSON.stringify({ 
        error: 'Too many requests', 
        reset: new Date(result.reset).getTime() 
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000),
        },
      }
    );
  }
  
  return null;
}
