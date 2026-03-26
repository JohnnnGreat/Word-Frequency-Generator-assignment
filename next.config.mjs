/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['natural', 'pdf-parse', 'mammoth'],
};

export default nextConfig;
