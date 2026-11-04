import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in a parent folder made Next guess the wrong workspace root.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
