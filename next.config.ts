import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://apitest144.pythonanywhere.com/**"),
      new URL("https://api.edutrackeg.com/**"),
    ],
  },
};

export default nextConfig;
