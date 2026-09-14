import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let prismaClient = globalForPrisma.prisma;

function getPrismaClient(): PrismaClient {
  if (prismaClient) return prismaClient;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL ortam değişkeni tanımlı değil.");
  }

  // Yerel geliştirme: file: ile başlayan adres SQLite demektir (adaptörsüz).
  // Üretim: mysql:// adresi MariaDB adaptörüyle bağlanır.
  const isLocalSqlite = databaseUrl.startsWith("file:");
  const adapter = isLocalSqlite ? undefined : new PrismaMariaDb(databaseUrl);
  prismaClient = adapter
    ? new PrismaClient({ adapter })
    : new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaClient;
  }

  return prismaClient;
}

// Next.js build sırasında API modüllerini içe aktarır. Proxy sayesinde gerçek
// veritabanı istemcisi yalnızca ilk sorguda oluşturulur; modül yüklenirken değil.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
