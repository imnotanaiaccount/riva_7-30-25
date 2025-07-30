import { LRUCache } from 'lru-cache';

/**
 * Rate limiter middleware
 * @param {Object} options - Configuration options
 * @param {number} options.uniqueTokenPerInterval - Number of unique tokens per interval
 * @param {number} options.interval - Interval in milliseconds
 * @returns {Object} Rate limiter instance with check method
 */
const rateLimit = (options) => {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (res, limit, token) =>
      new Promise((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) || 0) + 1;
        tokenCache.set(token, tokenCount);

        const currentUsage = tokenCount;
        const isRateLimited = currentUsage > limit;

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader(
          'X-RateLimit-Remaining',
          isRateLimited ? 0 : limit - currentUsage
        );

        // If we've reached the rate limit, reject the promise
        if (isRateLimited) {
          const rateLimitError = new Error('Rate limit exceeded');
          rateLimitError.statusCode = 429;
          reject(rateLimitError);
          return;
        }

        // Otherwise, resolve the promise
        resolve();
      }),
  };
};

export default rateLimit;
