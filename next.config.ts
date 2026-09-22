import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next dev logs Server Action arguments by default, including login credentials.
  logging: { serverFunctions: false },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-1539571696357-5a69c17a67c6",
        search:
          "?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-1609179242555-1d7b4b0a568c",
        search:
          "?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-1611695434398-4f4b330623e6",
        search:
          "?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-1567934872913-aacea74458b7",
        search:
          "?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
  },
};

export default nextConfig;
