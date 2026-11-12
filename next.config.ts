import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  // Science requests use the runtime route handler, so hosted environment changes
  // are not frozen into a build-time localhost rewrite.
};
export default nextConfig;
