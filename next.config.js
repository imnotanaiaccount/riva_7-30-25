const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: [
      'grainy-gradients.vercel.app', 
      'assets.calendly.com', 
      'js.stripe.com', 
      'www.chatbase.co',
      'vercel.live',
      '*.stripe.com',
      '*.googleapis.com',
      '*.gstatic.com',
      'images.unsplash.com', 
      'source.unsplash.com', 
      'tailwindui.com', 
      'lh3.googleusercontent.com', 
      'avatars.githubusercontent.com'
    ]
  },
  trailingSlash: true,
  
  // Webpack configuration to exclude 'micro' from bundling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = config.externals || {};
      config.externals['micro'] = 'micro';
    }
    return config;
  },

  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://assets.calendly.com https://www.chatbase.co https://vercel.live https://*.stripe.com https://unpkg.com https://cdn.jsdelivr.net https://www.google.com/recaptcha/;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "img-src 'self' data: https:;",
              "font-src 'self' https://fonts.gstatic.com;",
              "connect-src 'self' https://*.supabase.co https://*.stripe.com;",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.google.com/recaptcha/;",
            ].join(' ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Sentry configuration
  org: 'riva-official',
  project: 'riva-portfolio',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});