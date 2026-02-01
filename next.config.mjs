/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  // basePath is handled automatically by GH Pages usually but defining it explicitly is safer if needed.
  // User asked to change homepage which usually implies basepath handling.
  // Usually 'assetPrefix' is also set or handled by next-gh-pages logic? No, standard export handled by 'basePath'.
  basePath: '/auto-tycoon-2026',
  trailingSlash: true,
}

export default nextConfig
