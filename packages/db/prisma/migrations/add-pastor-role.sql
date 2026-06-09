-- Migration: add-pastor-role
-- Adiciona campo congregationId ao User (vincula Pastor à congregação).
-- O role PASTOR é apenas um novo valor da coluna role (String), não requer DDL.
-- Idempotente: seguro rodar mais de uma vez.

-- 1. Coluna congregationId no User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "congregationId" TEXT;

-- 2. Índice para filtragem por congregação
CREATE INDEX IF NOT EXISTS "User_congregationId_idx" ON "User"("congregationId");

-- 3. Foreign key User.congregationId -> Congregation.id (SET NULL no delete)
DO $$
BEGIN
  ALTER TABLE "User"
    ADD CONSTRAINT "User_congregationId_fkey"
    FOREIGN KEY ("congregationId") REFERENCES "Congregation"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 4. congregationId (opcional) nos módulos filtrados por PASTOR
ALTER TABLE "Event"  ADD COLUMN IF NOT EXISTS "congregationId" TEXT;
ALTER TABLE "Aviso"  ADD COLUMN IF NOT EXISTS "congregationId" TEXT;
ALTER TABLE "Curso"  ADD COLUMN IF NOT EXISTS "congregationId" TEXT;
ALTER TABLE "Escala" ADD COLUMN IF NOT EXISTS "congregationId" TEXT;

CREATE INDEX IF NOT EXISTS "Event_congregationId_idx"  ON "Event"("congregationId");
CREATE INDEX IF NOT EXISTS "Aviso_congregationId_idx"  ON "Aviso"("congregationId");
CREATE INDEX IF NOT EXISTS "Curso_congregationId_idx"  ON "Curso"("congregationId");
CREATE INDEX IF NOT EXISTS "Escala_congregationId_idx" ON "Escala"("congregationId");

