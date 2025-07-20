import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://apitest144.pythonanywhere.com/**")],
  },
};

export default nextConfig;
