// Script de migração Fase 2
// Roda: npx tsx scripts/migrate-fase2.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== MIGRAÇÃO FASE 2 === \n");

  const commands = [
    // 1. Criar tabela Aviso
    `CREATE TABLE IF NOT EXISTS "Aviso" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
      "tenantId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "authorId" TEXT,
      "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "dataFim" TIMESTAMP(3),
      "pinned" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE INDEX IF NOT EXISTS "Aviso_tenantId_idx" ON "Aviso"("tenantId")`,
    `CREATE INDEX IF NOT EXISTS "Aviso_tenantId_pinned_idx" ON "Aviso"("tenantId", "pinned")`,
    `CREATE INDEX IF NOT EXISTS "Aviso_dataInicio_idx" ON "Aviso"("dataInicio")`,
    `CREATE INDEX IF NOT EXISTS "Aviso_dataFim_idx" ON "Aviso"("dataFim")`,

    // 2. Criar tabela Patrimonio
    `CREATE TABLE IF NOT EXISTS "Patrimonio" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
      "tenantId" TEXT NOT NULL,
      "nome" TEXT NOT NULL,
      "descricao" TEXT,
      "categoria" TEXT,
      "localizacao" TEXT,
      "dataAquisicao" TIMESTAMP(3),
      "valor" DOUBLE PRECISION,
      "estado" TEXT NOT NULL DEFAULT 'NOVO',
      "responsavelId" TEXT,
      "qrCode" TEXT,
      "foto" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Patrimonio_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Patrimonio_qrCode_key" ON "Patrimonio"("qrCode")`,
    `CREATE INDEX IF NOT EXISTS "Patrimonio_tenantId_idx" ON "Patrimonio"("tenantId")`,
    `CREATE INDEX IF NOT EXISTS "Patrimonio_tenantId_categoria_idx" ON "Patrimonio"("tenantId", "categoria")`,
    `CREATE INDEX IF NOT EXISTS "Patrimonio_tenantId_estado_idx" ON "Patrimonio"("tenantId", "estado")`,
    `CREATE INDEX IF NOT EXISTS "Patrimonio_tenantId_isActive_idx" ON "Patrimonio"("tenantId", "isActive")`,

    // 3. AuditLog — colunas novas
    `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "tenantId" TEXT`,
    `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userId" TEXT`,
    `CREATE INDEX IF NOT EXISTS "AuditLog_tenantId_idx" ON "AuditLog"("tenantId")`,
    `CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt")`,
    `CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action")`,
  ];

  let ok = 0, skipped = 0, failed = 0;

  for (const sql of commands) {
    const label = sql.split("\n")[0].trim().substring(0, 50);
    try {
      await prisma.$executeRawUnsafe(sql.trim());
      console.log(`✅ ${label} ... OK`);
      ok++;
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("already exists") || msg.includes("42P07") || msg.includes("42710")) {
        console.log(`⚠️  ${label} ... JÁ EXISTE`);
        skipped++;
      } else {
        console.error(`❌ ${label} ... ERRO: ${msg.substring(0, 80)}`);
        failed++;
      }
    }
  }

  // Foreign Keys
  const fks = [
    { name: "Aviso_tenantId_fkey", sql: `ALTER TABLE "Aviso" ADD CONSTRAINT "Aviso_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE` },
    { name: "Patrimonio_tenantId_fkey", sql: `ALTER TABLE "Patrimonio" ADD CONSTRAINT "Patrimonio_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE` },
    { name: "AuditLog_tenantId_fkey", sql: `ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE` },
    { name: "Checkin_memberId_fkey", sql: `ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE` },
    { name: "Pedido_memberId_fkey", sql: `ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE` },
    { name: "CursoProgresso_memberId_fkey", sql: `ALTER TABLE "CursoProgresso" ADD CONSTRAINT "CursoProgresso_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE` },
  ];

  for (const fk of fks) {
    try {
      await prisma.$executeRawUnsafe(fk.sql);
      console.log(`✅ FK ${fk.name} ... OK`);
      ok++;
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("already exists") || msg.includes("42P07") || msg.includes("42710")) {
        console.log(`⚠️  FK ${fk.name} ... JÁ EXISTE`);
        skipped++;
      } else {
        console.error(`❌ FK ${fk.name} ... ERRO: ${msg.substring(0, 80)}`);
        failed++;
      }
    }
  }

  console.log(`\n=== RESUMO ===`);
  console.log(`✅ Sucesso: ${ok}`);
  console.log(`⚠️  Ignorado (já existe): ${skipped}`);
  console.log(`❌ Falhas: ${failed}`);

  if (failed > 0) process.exit(1);
}

main().finally(() => prisma.$disconnect());
