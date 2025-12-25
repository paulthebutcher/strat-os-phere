import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirect removed marketing pages to homepage
      {
        source: "/how-it-works",
        destination: "/",
        permanent: true,
      },
      {
        source: "/how-it-works/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/product",
        destination: "/",
        permanent: true,
      },
      {
        source: "/product/:path*",
        destination: "/",
        permanent: true,
      },
      // Redirect any other non-existent marketing pages mentioned in PR
      {
        source: "/features",
        destination: "/",
        permanent: true,
      },
      {
        source: "/use-cases",
        destination: "/",
        permanent: true,
      },
      {
        source: "/proof",
        destination: "/",
        permanent: true,
      },
      {
        source: "/evidence",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
