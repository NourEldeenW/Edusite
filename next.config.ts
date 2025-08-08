import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://apitest144.pythonanywhere.com/**"),
      new URL("https://edutrackeg.com/**"),
    ],
  },
};

export default nextConfig;
