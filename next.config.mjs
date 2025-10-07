const nextConfig = { 
  reactStrictMode: false, 
  images: { unoptimized: true },
  // Commented out backend proxy since we're using local API routes
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:5000/api/:path*',
  //     },
  //   ]
  // },
};

export default nextConfig;
