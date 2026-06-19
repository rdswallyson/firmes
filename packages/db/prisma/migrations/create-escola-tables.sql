-- Criar tabela Escola
CREATE TABLE IF NOT EXISTS "Escola" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "tenantId" TEXT NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    "coordenadorId" TEXT,
    status TEXT NOT NULL DEFAULT 'ATIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3)
);

-- Criar tabela EscolaAluno
CREATE TABLE IF NOT EXISTS "EscolaAluno" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "escolaId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices Escola
CREATE INDEX IF NOT EXISTS "Escola_tenantId_idx" ON "Escola"("tenantId");
CREATE INDEX IF NOT EXISTS "Escola_tenantId_status_idx" ON "Escola"("tenantId", status);

-- Índices EscolaAluno
CREATE INDEX IF NOT EXISTS "EscolaAluno_escolaId_idx" ON "EscolaAluno"("escolaId");
CREATE INDEX IF NOT EXISTS "EscolaAluno_memberId_idx" ON "EscolaAluno"("memberId");

-- Constraint unique (escolaId, memberId)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'EscolaAluno_escolaId_memberId_key'
    ) THEN
        ALTER TABLE "EscolaAluno" ADD CONSTRAINT "EscolaAluno_escolaId_memberId_key" UNIQUE ("escolaId", "memberId");
    END IF;
END $$;

-- Foreign keys Escola -> Member (coordenador)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Escola_coordenadorId_fkey'
    ) THEN
        ALTER TABLE "Escola" ADD CONSTRAINT "Escola_coordenadorId_fkey"
        FOREIGN KEY ("coordenadorId") REFERENCES "Member"(id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Foreign keys EscolaAluno -> Escola
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'EscolaAluno_escolaId_fkey'
    ) THEN
        ALTER TABLE "EscolaAluno" ADD CONSTRAINT "EscolaAluno_escolaId_fkey"
        FOREIGN KEY ("escolaId") REFERENCES "Escola"(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Foreign keys EscolaAluno -> Member
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'EscolaAluno_memberId_fkey'
    ) THEN
        ALTER TABLE "EscolaAluno" ADD CONSTRAINT "EscolaAluno_memberId_fkey"
        FOREIGN KEY ("memberId") REFERENCES "Member"(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Trigger para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'Escola_updatedAt_trigger'
    ) THEN
        CREATE TRIGGER "Escola_updatedAt_trigger"
        BEFORE UPDATE ON "Escola"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
