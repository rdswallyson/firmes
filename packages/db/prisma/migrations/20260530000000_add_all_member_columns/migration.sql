-- =================================================================
-- FIRMES — Adicionar TODAS as colunas faltantes na tabela Member
-- Execute no Supabase: SQL Editor → New query → colar → Run
-- =================================================================

-- -----------------------------------------------------------------
-- Texto simples
-- -----------------------------------------------------------------
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "sexo"                TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "estadoCivil"           TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "whatsapp"               TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "conjugeId"             TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "indicadoPorId"          TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "comoConheceu"           TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "observacoesPastorais"   TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "portalEmail"            TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "portalPassword"         TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "portalStatus"          TEXT DEFAULT 'PENDENTE';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "cpf"                    TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "rg"                     TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "escolaridade"           TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "pais"                  TEXT DEFAULT 'Brasil';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "batizado"               TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "phone2"                 TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "role"                  TEXT;

-- -----------------------------------------------------------------
-- Datas
-- -----------------------------------------------------------------
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "dataBatismoEspirito"  TIMESTAMP(3);
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "deletedAt"            TIMESTAMP(3);
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "dataConversao"         TIMESTAMP(3);

-- -----------------------------------------------------------------
-- JSON (filhos)
-- -----------------------------------------------------------------
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "filhos"                 JSONB;

-- -----------------------------------------------------------------
-- Arrays de texto
-- -----------------------------------------------------------------
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "ministerios"           TEXT[] DEFAULT '{}';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "disponibilidadeDias"    TEXT[] DEFAULT '{}';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "disponibilidadeTurnos" TEXT[] DEFAULT '{}';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "tags"                   TEXT[] DEFAULT '{}';

-- -----------------------------------------------------------------
-- Boolean
-- -----------------------------------------------------------------
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "lgpdAceite"             BOOLEAN DEFAULT false;

-- -----------------------------------------------------------------
-- Índices extras dos novos campos
-- -----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_member_portalStatus"  ON "Member"("portalStatus");
CREATE INDEX IF NOT EXISTS "idx_member_deletedAt"     ON "Member"("deletedAt") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_member_ministerios"   ON "Member" USING GIN("ministerios");
CREATE INDEX IF NOT EXISTS "idx_member_tags"          ON "Member" USING GIN("tags");
CREATE INDEX IF NOT EXISTS "idx_member_conjugeId"     ON "Member"("conjugeId");
CREATE INDEX IF NOT EXISTS "idx_member_cpf"          ON "Member"("cpf");

-- -----------------------------------------------------------------
-- Verificação: listar todas as colunas da tabela Member
-- -----------------------------------------------------------------
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Member'
ORDER BY ordinal_position;
