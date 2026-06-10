-- ============================================================
-- DIAGNÓSTICO: Verificar e corrigir tabela "Group"
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1) Verificar colunas existentes na tabela "Group"
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Group'
ORDER BY ordinal_position;

-- 2) Se alguma coluna abaixo estiver faltando ou for NOT NULL quando deveria ser nullable,
--    execute os comandos correspondentes:

-- Garantir que leaderId é nullable:
-- ALTER TABLE "Group" ALTER COLUMN "leaderId" DROP NOT NULL;

-- Adicionar colunas que podem estar faltando:
-- ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "leaderId2" TEXT;
-- ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "leaderId3" TEXT;
-- ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "leaderId4" TEXT;
-- ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "meetingDay" TEXT;
-- ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "meetingTime" TEXT;
-- ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "address" TEXT;
-- ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "dataAbertura" TIMESTAMP(3);
-- ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "perfil" TEXT;
-- ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "categorias" TEXT[] DEFAULT '{}';
-- ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "grupoOrigemId" TEXT;
-- ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- 3) Verificar constraints/foreign keys
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'Group';
