/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Allow unoptimized images for local blob URLs
    unoptimized: true,
  },
};

module.exports = nextConfig; 