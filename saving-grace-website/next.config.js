/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Required for GitHub Pages to resolve asset paths correctly if a basePath is needed,
  // but configure-pages action usually handles basePath. We just need the static export.
};

export default nextConfig;