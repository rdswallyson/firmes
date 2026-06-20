-- Adicionar escolaId na tabela Curso (se nao existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Curso' AND column_name = 'escolaId'
    ) THEN
        ALTER TABLE "Curso" ADD COLUMN "escolaId" TEXT;
    END IF;
END $$;

-- Foreign key Curso -> Escola
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Curso_escolaId_fkey'
    ) THEN
        ALTER TABLE "Curso" ADD CONSTRAINT "Curso_escolaId_fkey"
        FOREIGN KEY ("escolaId") REFERENCES "Escola"(id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
