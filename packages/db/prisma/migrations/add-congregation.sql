-- ============================================================
-- MIGRATION: add-congregation
-- Modulo Congregacao (opcional). Executar no Supabase SQL Editor.
-- Idempotente: usa IF NOT EXISTS / DO blocks.
-- ============================================================

-- 1) Tabela Congregation
CREATE TABLE IF NOT EXISTS "Congregation" (
  "id"          TEXT PRIMARY KEY,
  "tenantId"    TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "address"     TEXT,
  "city"        TEXT,
  "phone"       TEXT,
  "pastorId"    TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt"   TIMESTAMP(3)
);

-- 2) Colunas opcionais nos modelos existentes
ALTER TABLE "Member"  ADD COLUMN IF NOT EXISTS "congregationId" TEXT;
ALTER TABLE "Finance" ADD COLUMN IF NOT EXISTS "congregationId" TEXT;
ALTER TABLE "Culto"   ADD COLUMN IF NOT EXISTS "congregationId" TEXT;

-- 3) Indices
CREATE INDEX IF NOT EXISTS "Congregation_tenantId_idx" ON "Congregation"("tenantId");
CREATE INDEX IF NOT EXISTS "Congregation_tenantId_deletedAt_idx" ON "Congregation"("tenantId", "deletedAt");
CREATE INDEX IF NOT EXISTS "Member_congregationId_idx" ON "Member"("congregationId");

-- 4) Foreign Keys (com guard para nao duplicar)
DO $$ BEGIN
  ALTER TABLE "Congregation"
    ADD CONSTRAINT "Congregation_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Congregation"
    ADD CONSTRAINT "Congregation_pastorId_fkey"
    FOREIGN KEY ("pastorId") REFERENCES "Member"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Member"
    ADD CONSTRAINT "Member_congregationId_fkey"
    FOREIGN KEY ("congregationId") REFERENCES "Congregation"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Finance"
    ADD CONSTRAINT "Finance_congregationId_fkey"
    FOREIGN KEY ("congregationId") REFERENCES "Congregation"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Culto"
    ADD CONSTRAINT "Culto_congregationId_fkey"
    FOREIGN KEY ("congregationId") REFERENCES "Congregation"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
