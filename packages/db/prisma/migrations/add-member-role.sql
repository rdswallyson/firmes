-- MIGRATION: add-member-role.sql
-- Adicionar memberId na tabela User + FK para Member
-- IMPORTANTE: Execute no Supabase SQL Editor antes do deploy

-- 1. Adicionar coluna memberId se nao existir
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "memberId" TEXT;

-- 2. Tornar UNIQUE (somente se ainda nao for)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'User_memberId_key'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS "User_memberId_key" ON "User"("memberId");
  END IF;
END $$;

-- 3. FK de User.memberId → Member.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'User_memberId_fkey'
    AND table_name = 'User'
  ) THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_memberId_fkey"
      FOREIGN KEY ("memberId") REFERENCES "Member"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
