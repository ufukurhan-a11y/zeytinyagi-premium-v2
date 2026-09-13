import { defineConfig } from "@prisma/config";

// prisma generate yalnızca istemci kodunu üretir ve gerçek veritabanına bağlanmaz.
// Hostinger build ortamı DATABASE_URL'yi aktarmasa bile MySQL sağlayıcısıyla
// üretim tamamlanabilsin diye zararsız bir build-time adresi kullanılır.
// Uygulama çalışırken src/lib/prisma.ts gerçek DATABASE_URL'yi zorunlu tutar.
const databaseUrl =
  process.env.DATABASE_URL ??
  "mysql://build:build@localhost:3306/build";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
