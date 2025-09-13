/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["images.pexels.com"],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NODE_ENV === "production"
        ? "https://api.topplaced.com"
        : "http://localhost:5000",
  },
  output: "export", // ✅ enables static export
};

module.exports = nextConfig;
