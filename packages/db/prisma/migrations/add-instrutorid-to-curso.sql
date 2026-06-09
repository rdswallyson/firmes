-- ALTER TABLE para adicionar instrutorId na tabela Curso
ALTER TABLE "Curso" ADD COLUMN IF NOT EXISTS "instrutorId" TEXT;

-- FK para Member
ALTER TABLE "Curso" ADD CONSTRAINT IF NOT EXISTS "Curso_instrutorId_fkey"
  FOREIGN KEY ("instrutorId") REFERENCES "Member"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Index para performance
CREATE INDEX IF NOT EXISTS "Curso_instrutorId_idx" ON "Curso"("instrutorId");
