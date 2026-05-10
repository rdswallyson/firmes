-- Migration: add missing tables (safe - IF NOT EXISTS)
-- Tabelas: Group, GroupMember, GroupFrequencia, Midia,
--          CursoCategoria, Curso, CursoModulo, CursoAula, CursoProgresso,
--          Culto, Checkin, Escala, EscalaMembro, Notificacao, AuditLog

-- Enum Plan (ignorar se já existir)
DO $$ BEGIN
  CREATE TYPE "Plan" AS ENUM ('FREE', 'PRATA', 'OURO', 'DIAMANTE', 'ESMERALDA_STARTER', 'ESMERALDA_PRO', 'ESMERALDA_PLUS', 'ESMERALDA_ULTRA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── GRUPOS ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Group" (
    "id"          TEXT NOT NULL,
    "tenantId"    TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "leaderId"    TEXT,
    "meetingDay"  TEXT,
    "meetingTime" TEXT,
    "address"     TEXT,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GroupMember" (
    "id"       TEXT NOT NULL,
    "groupId"  TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GroupFrequencia" (
    "id"          TEXT NOT NULL,
    "groupId"     TEXT NOT NULL,
    "date"        TIMESTAMP(3) NOT NULL,
    "presentes"   INTEGER NOT NULL DEFAULT 0,
    "ausentes"    INTEGER NOT NULL DEFAULT 0,
    "visitantes"  INTEGER NOT NULL DEFAULT 0,
    "observacao"  TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupFrequencia_pkey" PRIMARY KEY ("id")
);

-- ── MÍDIAS ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Midia" (
    "id"          TEXT NOT NULL,
    "tenantId"    TEXT NOT NULL,
    "titulo"      TEXT NOT NULL,
    "tipo"        TEXT NOT NULL,
    "categoria"   TEXT NOT NULL,
    "url"         TEXT NOT NULL,
    "pregador"    TEXT,
    "data"        TIMESTAMP(3),
    "duracao"     TEXT,
    "reproducoes" INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Midia_pkey" PRIMARY KEY ("id")
);

-- ── ENSINO ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "CursoCategoria" (
    "id"        TEXT NOT NULL,
    "tenantId"  TEXT NOT NULL,
    "nome"      TEXT NOT NULL,
    "cor"       TEXT NOT NULL DEFAULT '#1D4ED8',
    "ordem"     INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CursoCategoria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Curso" (
    "id"           TEXT NOT NULL,
    "tenantId"     TEXT NOT NULL,
    "titulo"       TEXT NOT NULL,
    "descricao"    TEXT,
    "banner"       TEXT,
    "categoria"    TEXT NOT NULL DEFAULT 'ESTUDO',
    "nivel"        TEXT NOT NULL DEFAULT 'INICIANTE',
    "publicado"    BOOLEAN NOT NULL DEFAULT false,
    "cargaHoraria" INTEGER,
    "instrutor"    TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CursoModulo" (
    "id"      TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "titulo"  TEXT NOT NULL,
    "ordem"   INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CursoModulo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CursoAula" (
    "id"       TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "titulo"   TEXT NOT NULL,
    "tipo"     TEXT NOT NULL DEFAULT 'VIDEO',
    "conteudo" TEXT,
    "duracao"  TEXT,
    "ordem"    INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CursoAula_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CursoProgresso" (
    "id"        TEXT NOT NULL,
    "cursoId"   TEXT NOT NULL,
    "aulaId"    TEXT NOT NULL,
    "memberId"  TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "dataHora"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CursoProgresso_pkey" PRIMARY KEY ("id")
);

-- ── CULTOS & CHECK-IN ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Culto" (
    "id"        TEXT NOT NULL,
    "tenantId"  TEXT NOT NULL,
    "titulo"    TEXT NOT NULL,
    "data"      TIMESTAMP(3) NOT NULL,
    "qrCode"    TEXT NOT NULL,
    "ativo"     BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Culto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Checkin" (
    "id"           TEXT NOT NULL,
    "cultoId"      TEXT NOT NULL,
    "tenantId"     TEXT NOT NULL,
    "nome"         TEXT NOT NULL,
    "tipo"         TEXT NOT NULL,
    "memberId"     TEXT,
    "telefone"     TEXT,
    "comoConheceu" TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

-- ── ESCALAS ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Escala" (
    "id"          TEXT NOT NULL,
    "tenantId"    TEXT NOT NULL,
    "titulo"      TEXT NOT NULL,
    "data"        TIMESTAMP(3) NOT NULL,
    "ministerio"  TEXT NOT NULL,
    "observacoes" TEXT,
    "status"      TEXT NOT NULL DEFAULT 'ATIVA',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Escala_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EscalaMembro" (
    "id"        TEXT NOT NULL,
    "escalaId"  TEXT NOT NULL,
    "memberId"  TEXT NOT NULL,
    "funcao"    TEXT NOT NULL,
    "status"    TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EscalaMembro_pkey" PRIMARY KEY ("id")
);

-- ── NOTIFICAÇÕES ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Notificacao" (
    "id"             TEXT NOT NULL,
    "tenantId"       TEXT NOT NULL,
    "titulo"         TEXT NOT NULL,
    "mensagem"       TEXT NOT NULL,
    "canal"          TEXT NOT NULL,
    "destinatario"   TEXT NOT NULL,
    "grupoId"        TEXT,
    "enviadoEm"      TIMESTAMP(3),
    "totalEnviados"  INTEGER NOT NULL DEFAULT 0,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- ── AUDIT LOG ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id"        TEXT NOT NULL,
    "action"    TEXT NOT NULL,
    "targetId"  TEXT NOT NULL,
    "details"   TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- ── INDEXES ───────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "GroupMember_groupId_memberId_key"
    ON "GroupMember"("groupId", "memberId");

CREATE INDEX IF NOT EXISTS "GroupFrequencia_groupId_date_idx"
    ON "GroupFrequencia"("groupId", "date");

CREATE UNIQUE INDEX IF NOT EXISTS "CursoCategoria_tenantId_nome_key"
    ON "CursoCategoria"("tenantId", "nome");

CREATE UNIQUE INDEX IF NOT EXISTS "CursoProgresso_cursoId_aulaId_memberId_key"
    ON "CursoProgresso"("cursoId", "aulaId", "memberId");

CREATE UNIQUE INDEX IF NOT EXISTS "Culto_qrCode_key"
    ON "Culto"("qrCode");

-- ── FOREIGN KEYS (ignorar se já existir) ─────────────────────────────────────

DO $$ BEGIN ALTER TABLE "Group" ADD CONSTRAINT "Group_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "Group" ADD CONSTRAINT "Group_leaderId_fkey"
    FOREIGN KEY ("leaderId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_memberId_fkey"
    FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "GroupFrequencia" ADD CONSTRAINT "GroupFrequencia_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "Midia" ADD CONSTRAINT "Midia_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "CursoModulo" ADD CONSTRAINT "CursoModulo_cursoId_fkey"
    FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "CursoAula" ADD CONSTRAINT "CursoAula_moduloId_fkey"
    FOREIGN KEY ("moduloId") REFERENCES "CursoModulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "CursoProgresso" ADD CONSTRAINT "CursoProgresso_cursoId_fkey"
    FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "CursoProgresso" ADD CONSTRAINT "CursoProgresso_aulaId_fkey"
    FOREIGN KEY ("aulaId") REFERENCES "CursoAula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "Culto" ADD CONSTRAINT "Culto_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_cultoId_fkey"
    FOREIGN KEY ("cultoId") REFERENCES "Culto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "Escala" ADD CONSTRAINT "Escala_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "EscalaMembro" ADD CONSTRAINT "EscalaMembro_escalaId_fkey"
    FOREIGN KEY ("escalaId") REFERENCES "Escala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "EscalaMembro" ADD CONSTRAINT "EscalaMembro_memberId_fkey"
    FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
