/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: ['avatars.githubusercontent.com', 'github.com', 'raw.githubusercontent.com'] },
  experimental: { appDir: true }
}
module.exports = nextConfig
