import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
  },
  // Prisma 7 + native SQLite adapter: bunları webpack dışarıda bırak (native modüller bundle edilemez)
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-better-sqlite3", "better-sqlite3"],
};

export default nextConfig;
