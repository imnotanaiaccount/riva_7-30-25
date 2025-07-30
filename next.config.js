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
      '*.gstatic.com'
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
  }
}

module.exports = nextConfig;