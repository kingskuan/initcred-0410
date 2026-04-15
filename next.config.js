/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com', 'raw.githubusercontent.com']
  }
  // Note: appDir is stable in Next.js 14, no need for experimental flag
}
module.exports = nextConfig
