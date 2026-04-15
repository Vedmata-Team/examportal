import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/db", "@workspace/api-zod", "@workspace/api-client-react"],
  experimental: {},
  env: {
    API_BASE_URL: process.env.API_BASE_URL || "http://localhost:8080",
  },
};

export default nextConfig;
