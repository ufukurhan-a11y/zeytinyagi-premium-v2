import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const setupStatements = [
  `CREATE TABLE IF NOT EXISTS \`Customer\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`name\` VARCHAR(191) NOT NULL,
    \`phone\` VARCHAR(191) NOT NULL,
    \`city\` VARCHAR(191) NOT NULL,
    \`district\` VARCHAR(191) NOT NULL,
    \`address\` VARCHAR(191) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX \`Customer_phone_key\` (\`phone\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS \`Order\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`orderNo\` VARCHAR(191) NOT NULL,
    \`status\` VARCHAR(191) NOT NULL DEFAULT 'new',
    \`total\` INTEGER NOT NULL,
    \`paymentMethod\` VARCHAR(191) NOT NULL,
    \`note\` VARCHAR(191) NULL,
    \`receipt\` VARCHAR(191) NULL,
    \`receiptAt\` DATETIME(3) NULL,
    \`receiptBy\` VARCHAR(191) NULL DEFAULT 'customer',
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`customerId\` VARCHAR(191) NOT NULL,
    UNIQUE INDEX \`Order_orderNo_key\` (\`orderNo\`),
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`Order_customerId_fkey\`
      FOREIGN KEY (\`customerId\`) REFERENCES \`Customer\` (\`id\`)
      ON DELETE RESTRICT ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS \`OrderItem\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`orderId\` VARCHAR(191) NOT NULL,
    \`productId\` VARCHAR(191) NOT NULL,
    \`label\` VARCHAR(191) NOT NULL,
    \`sublabel\` VARCHAR(191) NOT NULL,
    \`price\` INTEGER NOT NULL,
    \`qty\` INTEGER NOT NULL,
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`OrderItem_orderId_fkey\`
      FOREIGN KEY (\`orderId\`) REFERENCES \`Order\` (\`id\`)
      ON DELETE RESTRICT ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
];

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { ok: false, message: "Önce admin paneline giriş yapın." },
      { status: 401 },
    );
  }

  try {
    for (const statement of setupStatements) {
      await prisma.$executeRawUnsafe(statement);
    }

    return NextResponse.json({
      ok: true,
      message: "MySQL tabloları başarıyla hazırlandı.",
      tables: ["Customer", "Order", "OrderItem"],
    });
  } catch (error) {
    console.error("Database setup failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "MySQL tabloları hazırlanamadı. DATABASE_URL bağlantısını kontrol edin.",
      },
      { status: 500 },
    );
  }
}
