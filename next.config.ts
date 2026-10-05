import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Routes that existed in earlier revisions of the site. Everything they
   * showed is now on the homepage, so inbound links land there.
   */
  async redirects() {
    return [
      "/compare",
      "/gateways",
      "/gateways/:slug",
      "/categories",
      "/categories/:slug",
      "/blog",
      "/blog/:slug",
    ].map((source) => ({ source, destination: "/", permanent: true }));
  },
};

export default nextConfig;
