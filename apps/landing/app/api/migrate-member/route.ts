import { NextResponse } from "next/server";
import { prisma } from "@firmes/db";

const SQL_COMMANDS = [
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "sexo" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "estadoCivil" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "dataBatismoEspirito" TIMESTAMP(3);`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "conjugeId" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "indicadoPorId" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "comoConheceu" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "observacoesPastorais" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "portalEmail" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "portalPassword" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "portalStatus" TEXT DEFAULT 'PENDENTE';`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "cpf" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "rg" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "escolaridade" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "pais" TEXT DEFAULT 'Brasil';`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "batizado" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "phone2" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "role" TEXT;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "dataConversao" TIMESTAMP(3);`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "filhos" JSONB;`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "ministerios" TEXT[] DEFAULT '{}';`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "disponibilidadeDias" TEXT[] DEFAULT '{}';`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "disponibilidadeTurnos" TEXT[] DEFAULT '{}';`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';`,
  `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "lgpdAceite" BOOLEAN DEFAULT false;`,
];

export async function GET() {
  const results: { command: string; status: string; error?: string }[] = [];

  for (const sql of SQL_COMMANDS) {
    try {
      await prisma.$executeRawUnsafe(sql);
      results.push({ command: sql.split("ADD COLUMN IF NOT EXISTS")[1]?.split(";")[0]?.trim() || sql, status: "OK" });
    } catch (err: any) {
      results.push({ command: sql, status: "FALHOU", error: err.message });
    }
  }

  return NextResponse.json({
    message: "Migração executada.",
    total: SQL_COMMANDS.length,
    ok: results.filter(r => r.status === "OK").length,
    falhas: results.filter(r => r.status === "FALHOU").length,
    results,
  });
}
