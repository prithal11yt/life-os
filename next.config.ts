import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project — there are other lockfiles higher up
  // in the home directory that Next would otherwise pick as the root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
