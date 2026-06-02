/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // unpdf / pdfjs work in the node runtime; keep them external on the server.
    serverComponentsExternalPackages: ["unpdf"],
  },
};

export default nextConfig;
