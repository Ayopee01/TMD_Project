/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ เอาบรรทัดนี้กลับมาครับ! (เพื่อให้ App รู้จักคำว่า /test5)
  basePath: '/test2', 

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
};

module.exports = nextConfig;