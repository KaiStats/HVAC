/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // unpdf / pdfjs / mammoth work in the node runtime; keep them external.
    serverComponentsExternalPackages: ["unpdf", "mammoth"],
  },
};

export default nextConfig;
