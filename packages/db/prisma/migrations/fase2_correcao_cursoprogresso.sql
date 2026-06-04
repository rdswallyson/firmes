-- ============================================================
-- FASE 2 — Correção: CursoProgresso memberId NOT NULL
-- Execute no Supabase SQL Editor
-- ============================================================

-- ETAPA 1: Tornar memberId nullable (REMOVER NOT NULL)
ALTER TABLE "CursoProgresso" ALTER COLUMN "memberId" DROP NOT NULL;

-- ETAPA 2: Limpar registros inválidos (já deve estar limpo, mas garante)
UPDATE "CursoProgresso" SET "memberId" = NULL 
WHERE "memberId" = 'current-user' 
   OR "memberId" = '' 
   OR "memberId" = 'null'
   OR "memberId" IS NULL;

-- ETAPA 3: Criar a FK agora que memberId aceita NULL
ALTER TABLE "CursoProgresso" ADD CONSTRAINT "CursoProgresso_memberId_fkey" 
FOREIGN KEY ("memberId") REFERENCES "Member"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- VERIFICAÇÃO: Verificar se deu certo
-- ============================================================
-- Rode esta query após executar acima para confirmar:
-- SELECT column_name, is_nullable, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'CursoProgresso' AND column_name = 'memberId';
-- 
-- Deve retornar: is_nullable = YES
--
-- Para ver a FK:
-- SELECT constraint_name FROM information_schema.table_constraints 
-- WHERE table_name = 'CursoProgresso' AND constraint_type = 'FOREIGN KEY';
-- 
-- Deve retornar: CursoProgresso_memberId_fkey
