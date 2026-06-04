-- ============================================================
-- FASE 2 — Correções Schema FIRMES
-- Gerado: 02/06/2026
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. NOVA TABELA: Aviso
CREATE TABLE "Aviso" (
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
);
CREATE INDEX "Aviso_tenantId_idx" ON "Aviso"("tenantId");
CREATE INDEX "Aviso_tenantId_pinned_idx" ON "Aviso"("tenantId", "pinned");
CREATE INDEX "Aviso_dataInicio_idx" ON "Aviso"("dataInicio");
CREATE INDEX "Aviso_dataFim_idx" ON "Aviso"("dataFim");
ALTER TABLE "Aviso" ADD CONSTRAINT "Aviso_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 2. NOVA TABELA: Patrimonio
CREATE TABLE "Patrimonio" (
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
);
CREATE UNIQUE INDEX "Patrimonio_qrCode_key" ON "Patrimonio"("qrCode");
CREATE INDEX "Patrimonio_tenantId_idx" ON "Patrimonio"("tenantId");
CREATE INDEX "Patrimonio_tenantId_categoria_idx" ON "Patrimonio"("tenantId", "categoria");
CREATE INDEX "Patrimonio_tenantId_estado_idx" ON "Patrimonio"("tenantId", "estado");
CREATE INDEX "Patrimonio_tenantId_isActive_idx" ON "Patrimonio"("tenantId", "isActive");
ALTER TABLE "Patrimonio" ADD CONSTRAINT "Patrimonio_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. ALTER TABLE: AuditLog — adicionar tenantId + index
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userId" TEXT;
CREATE INDEX IF NOT EXISTS "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. ALTER TABLE: Checkin — adicionar FK memberId
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. ALTER TABLE: Pedido — adicionar FK memberId
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. ALTER TABLE: CursoProgresso — adicionar FK memberId
ALTER TABLE "CursoProgresso" ADD CONSTRAINT "CursoProgresso_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
