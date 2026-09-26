/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/frappe/:path*",
        destination: "https://liaisonbank.frappe.cloud/api/method/:path*",
      },
    ];
  },
  reactCompiler: true,
};

export default nextConfig;