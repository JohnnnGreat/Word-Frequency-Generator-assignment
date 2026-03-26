/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['pdf-parse', 'mammoth'],
};

export default nextConfig;
