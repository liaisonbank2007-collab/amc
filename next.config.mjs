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

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "liaisonbank.frappe.cloud",
        // pathname: "/files/**", // optional: narrow to just the files folder
      },
    ],
  },
};

export default nextConfig;