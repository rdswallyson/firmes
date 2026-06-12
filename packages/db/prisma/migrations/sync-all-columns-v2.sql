-- ============================================================
-- SYNC ALL COLUMNS v2 — SQL idempotente para alinhar banco com schema.prisma
-- Execute no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 0) CRIAR TABELAS QUE NÃO EXISTEM (estrutura mínima)
-- ============================================================

CREATE TABLE IF NOT EXISTS "Tenant" (
  "id"                   TEXT PRIMARY KEY,
  "name"                 TEXT NOT NULL,
  "slug"                 TEXT NOT NULL UNIQUE,
  "logo"                 TEXT,
  "primaryColor"         TEXT NOT NULL DEFAULT '#1A3C6E',
  "secondaryColor"       TEXT NOT NULL DEFAULT '#C8922A',
  "domain"               TEXT,
  "plan"                 TEXT NOT NULL DEFAULT 'FREE',
  "isWhiteLabel"         BOOLEAN NOT NULL DEFAULT false,
  "maxChurches"          INTEGER NOT NULL DEFAULT 1,
  "resellerId"           TEXT,
  "isActive"             BOOLEAN NOT NULL DEFAULT true,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "customDomain"         TEXT,
  "customName"           TEXT,
  "stripeCustomerId"     TEXT,
  "stripePriceId"        TEXT,
  "stripeSubscriptionId" TEXT,
  "subscriptionStatus"   TEXT,
  "trialEndsAt"          TIMESTAMP(3),
  "onboardingCompleted"  BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "User" (
  "id"              TEXT PRIMARY KEY,
  "name"            TEXT NOT NULL,
  "email"           TEXT NOT NULL UNIQUE,
  "password"        TEXT NOT NULL,
  "role"            TEXT NOT NULL DEFAULT 'ADMIN',
  "tenantId"        TEXT NOT NULL,
  "memberId"        TEXT,
  "congregationId"  TEXT,
  "avatar"          TEXT,
  "phone"           TEXT,
  "isActive"        BOOLEAN NOT NULL DEFAULT true,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acceptedTermsAt" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "Member" (
  "id"           TEXT PRIMARY KEY,
  "tenantId"     TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "email"        TEXT,
  "phone"        TEXT,
  "birthDate"    TIMESTAMP(3),
  "address"      TEXT,
  "photo"        TEXT,
  "memberSince"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status"       TEXT NOT NULL DEFAULT 'ACTIVE',
  "role"         TEXT,
  "groupId"      TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "baptismDate"  TIMESTAMP(3),
  "cep"          TEXT,
  "city"         TEXT,
  "complement"   TEXT,
  "isActive"     BOOLEAN NOT NULL DEFAULT true,
  "neighborhood" TEXT,
  "notes"        TEXT,
  "number"       TEXT,
  "state"        TEXT,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sexo"                    TEXT,
  "estadoCivil"             TEXT,
  "whatsapp"                TEXT,
  "dataBatismoEspirito"     TIMESTAMP(3),
  "ministerios"             TEXT[] DEFAULT '{}',
  "disponibilidadeDias"     TEXT[] DEFAULT '{}',
  "disponibilidadeTurnos"   TEXT[] DEFAULT '{}',
  "tags"                    TEXT[] DEFAULT '{}',
  "conjugeId"               TEXT,
  "filhos"                  JSONB,
  "indicadoPorId"           TEXT,
  "comoConheceu"            TEXT,
  "observacoesPastorais"    TEXT,
  "portalEmail"             TEXT,
  "portalPassword"          TEXT,
  "portalStatus"            TEXT DEFAULT 'PENDENTE',
  "deletedAt"               TIMESTAMP(3),
  "phone2"                  TEXT,
  "cpf"                     TEXT,
  "rg"                      TEXT,
  "escolaridade"            TEXT,
  "pais"                    TEXT,
  "batizado"                TEXT,
  "dataConversao"           TIMESTAMP(3),
  "lgpdAceite"              BOOLEAN NOT NULL DEFAULT false,
  "congregationId"          TEXT
);

CREATE TABLE IF NOT EXISTS "Group" (
  "id"          TEXT PRIMARY KEY,
  "tenantId"    TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "leaderId"    TEXT,
  "leaderId2"   TEXT,
  "leaderId3"   TEXT,
  "leaderId4"   TEXT,
  "meetingDay"  TEXT,
  "meetingTime" TEXT,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "address"     TEXT,
  "dataAbertura" TIMESTAMP(3),
  "perfil"      TEXT,
  "categorias"  TEXT[] DEFAULT '{}',
  "grupoOrigemId" TEXT
);

CREATE TABLE IF NOT EXISTS "GroupMember" (
  "id"       TEXT PRIMARY KEY,
  "groupId"  TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("groupId", "memberId")
);

CREATE TABLE IF NOT EXISTS "GroupFrequencia" (
  "id"         TEXT PRIMARY KEY,
  "groupId"    TEXT NOT NULL,
  "date"       TIMESTAMP(3) NOT NULL,
  "presentes"  INTEGER NOT NULL DEFAULT 0,
  "ausentes"   INTEGER NOT NULL DEFAULT 0,
  "visitantes" INTEGER NOT NULL DEFAULT 0,
  "observacao" TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Event" (
  "id"                TEXT PRIMARY KEY,
  "tenantId"          TEXT NOT NULL,
  "congregationId"    TEXT,
  "title"             TEXT NOT NULL,
  "description"       TEXT,
  "date"              TIMESTAMP(3) NOT NULL,
  "location"          TEXT,
  "isPublic"          BOOLEAN NOT NULL DEFAULT true,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "banner"            TEXT,
  "isGratuito"        BOOLEAN NOT NULL DEFAULT true,
  "linkExterno"       TEXT,
  "maxVagas"          INTEGER,
  "recorrente"        BOOLEAN NOT NULL DEFAULT false,
  "slug"              TEXT UNIQUE,
  "status"            TEXT NOT NULL DEFAULT 'ABERTO',
  "valor"             DOUBLE PRECISION,
  "alimentacaoAtiva"  BOOLEAN NOT NULL DEFAULT false,
  "alimentacaoModelo" TEXT,
  "avancado"          BOOLEAN NOT NULL DEFAULT false,
  "cidadeExterna"     TEXT,
  "enderecoRetirada"  TEXT,
  "instrucaoRetirada" TEXT,
  "endereco"          TEXT,
  "googleMapsLink"    TEXT,
  "organizadorId"     TEXT,
  "dataFim"           TIMESTAMP(3),
  "subtitulo"         TEXT,
  "telefoneObrigatorio"   BOOLEAN NOT NULL DEFAULT false,
  "enderecoObrigatorio"   BOOLEAN NOT NULL DEFAULT false,
  "emailObrigatorio"      BOOLEAN NOT NULL DEFAULT false,
  "ocultarTelefone"       BOOLEAN NOT NULL DEFAULT false,
  "ocultarEndereco"       BOOLEAN NOT NULL DEFAULT false,
  "formaPagamento"        TEXT,
  "ministerioResponsavel" TEXT
);

CREATE TABLE IF NOT EXISTS "Inscricao" (
  "id"              TEXT PRIMARY KEY,
  "tenantId"        TEXT NOT NULL,
  "eventId"         TEXT NOT NULL,
  "nome"            TEXT NOT NULL,
  "email"           TEXT NOT NULL,
  "telefone"        TEXT,
  "tipo"            TEXT NOT NULL DEFAULT 'MEMBRO',
  "memberId"        TEXT,
  "status"          TEXT NOT NULL DEFAULT 'CONFIRMADO',
  "qrCode"          TEXT UNIQUE,
  "checkinAt"       TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "formaPagamento"  TEXT,
  "lancamentoId"    TEXT,
  "pagamentoStatus" TEXT NOT NULL DEFAULT 'PENDENTE'
);

CREATE TABLE IF NOT EXISTS "Finance" (
  "id"            TEXT PRIMARY KEY,
  "tenantId"      TEXT NOT NULL,
  "type"          TEXT NOT NULL,
  "category"      TEXT NOT NULL,
  "amount"        DOUBLE PRECISION NOT NULL,
  "description"   TEXT,
  "date"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "contaId"       TEXT,
  "isActive"      BOOLEAN NOT NULL DEFAULT true,
  "memberId"      TEXT,
  "memberName"    TEXT,
  "metaId"        TEXT,
  "reciboNum"     TEXT,
  "paymentMethod" TEXT,
  "status"        TEXT NOT NULL DEFAULT 'CONFIRMADO',
  "congregationId" TEXT
);

CREATE TABLE IF NOT EXISTS "ContaBancaria" (
  "id"          TEXT PRIMARY KEY,
  "tenantId"    TEXT NOT NULL,
  "nome"        TEXT NOT NULL,
  "banco"       TEXT,
  "agencia"     TEXT,
  "numeroConta" TEXT,
  "saldo"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "isAtiva"     BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Meta" (
  "id"         TEXT PRIMARY KEY,
  "tenantId"   TEXT NOT NULL,
  "titulo"     TEXT NOT NULL,
  "descricao"  TEXT,
  "valorMeta"  DOUBLE PRECISION NOT NULL,
  "valorAtual" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "dataFim"    TIMESTAMP(3),
  "isAtiva"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id"        TEXT PRIMARY KEY,
  "action"    TEXT NOT NULL,
  "targetId"  TEXT NOT NULL,
  "details"   TEXT NOT NULL,
  "tenantId"  TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId"    TEXT
);

CREATE TABLE IF NOT EXISTS "Aviso" (
  "id"             TEXT PRIMARY KEY,
  "tenantId"       TEXT NOT NULL,
  "congregationId" TEXT,
  "title"          TEXT NOT NULL,
  "content"        TEXT NOT NULL,
  "authorId"       TEXT,
  "dataInicio"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataFim"        TIMESTAMP(3),
  "pinned"         BOOLEAN NOT NULL DEFAULT false,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Patrimonio" (
  "id"           TEXT PRIMARY KEY,
  "tenantId"     TEXT NOT NULL,
  "nome"         TEXT NOT NULL,
  "descricao"    TEXT,
  "categoria"    TEXT,
  "localizacao"  TEXT,
  "dataAquisicao" TIMESTAMP(3),
  "valor"        DOUBLE PRECISION,
  "estado"       TEXT NOT NULL DEFAULT 'NOVO',
  "responsavelId" TEXT,
  "qrCode"       TEXT UNIQUE,
  "foto"         TEXT,
  "isActive"     BOOLEAN NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "EventoRefeicao" (
  "id"      TEXT PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "nome"    TEXT NOT NULL,
  "emoji"   TEXT,
  "modelo"  TEXT NOT NULL,
  "valor"   DOUBLE PRECISION,
  "dias"    TEXT NOT NULL,
  "ativo"   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "InscricaoRefeicao" (
  "id"          TEXT PRIMARY KEY,
  "inscricaoId" TEXT NOT NULL,
  "refeicaoId"  TEXT NOT NULL,
  "dia"         TEXT NOT NULL,
  "usadoEm"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("inscricaoId", "refeicaoId", "dia")
);

CREATE TABLE IF NOT EXISTS "EventoCheckinPonto" (
  "id"      TEXT PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "nome"    TEXT NOT NULL,
  "tipo"    TEXT NOT NULL,
  "qrToken" TEXT UNIQUE,
  "ativo"   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "EventoCheckinScan" (
  "id"          TEXT PRIMARY KEY,
  "pontoId"     TEXT NOT NULL,
  "inscricaoId" TEXT NOT NULL,
  "dataHora"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "valido"      BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "Produto" (
  "id"             TEXT PRIMARY KEY,
  "tenantId"       TEXT NOT NULL,
  "nome"           TEXT NOT NULL,
  "descricao"      TEXT,
  "foto"           TEXT,
  "preco"          DOUBLE PRECISION NOT NULL,
  "categoria"      TEXT NOT NULL,
  "estoque"        INTEGER NOT NULL DEFAULT 0,
  "ativo"          BOOLEAN NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ProdutoVariacao" (
  "id"        TEXT PRIMARY KEY,
  "produtoId" TEXT NOT NULL,
  "tipo"      TEXT NOT NULL,
  "opcao"     TEXT NOT NULL,
  "estoque"   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "Pedido" (
  "id"             TEXT PRIMARY KEY,
  "tenantId"       TEXT NOT NULL,
  "memberId"       TEXT,
  "nomeComprador"  TEXT NOT NULL,
  "telefone"       TEXT,
  "email"          TEXT,
  "status"         TEXT NOT NULL DEFAULT 'PENDENTE',
  "formaPagamento" TEXT,
  "total"          DOUBLE PRECISION NOT NULL,
  "lancamentoId"   TEXT,
  "eventId"        TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PedidoItem" (
  "id"         TEXT PRIMARY KEY,
  "pedidoId"   TEXT NOT NULL,
  "produtoId"  TEXT NOT NULL,
  "variacaoId" TEXT,
  "quantidade" INTEGER NOT NULL,
  "preco"      DOUBLE PRECISION NOT NULL,
  "entregue"   BOOLEAN NOT NULL DEFAULT false,
  "entregueEm" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "InscricaoPedidoItem" (
  "id"          TEXT PRIMARY KEY,
  "inscricaoId" TEXT NOT NULL,
  "produtoId"   TEXT NOT NULL,
  "variacaoId"  TEXT,
  "quantidade"  INTEGER NOT NULL,
  "preco"       DOUBLE PRECISION NOT NULL,
  "entregue"    BOOLEAN NOT NULL DEFAULT false,
  "entregueEm"  TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "EventoProduto" (
  "id"        TEXT PRIMARY KEY,
  "eventId"   TEXT NOT NULL,
  "produtoId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Cupom" (
  "id"        TEXT PRIMARY KEY,
  "tenantId"  TEXT NOT NULL,
  "codigo"    TEXT NOT NULL UNIQUE,
  "desconto"  DOUBLE PRECISION NOT NULL,
  "tipo"      TEXT NOT NULL,
  "maxUsos"   INTEGER,
  "usosAtual" INTEGER NOT NULL DEFAULT 0,
  "validade"  TIMESTAMP(3),
  "ativo"     BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "EventoFase" (
  "id"         TEXT PRIMARY KEY,
  "eventId"    TEXT NOT NULL,
  "nome"       TEXT NOT NULL,
  "ordem"      INTEGER NOT NULL,
  "status"     TEXT NOT NULL DEFAULT 'PENDENTE',
  "dataInicio" TIMESTAMP(3),
  "dataFim"    TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "EventoEquipe" (
  "id"            TEXT PRIMARY KEY,
  "eventId"       TEXT NOT NULL,
  "nome"          TEXT NOT NULL,
  "funcao"        TEXT NOT NULL,
  "responsavelId" TEXT
);

CREATE TABLE IF NOT EXISTS "EventoMembro" (
  "id"         TEXT PRIMARY KEY,
  "equipeId"   TEXT NOT NULL,
  "pessoaId"   TEXT NOT NULL,
  "funcaoSpec" TEXT
);

CREATE TABLE IF NOT EXISTS "EventoChecklist" (
  "id"            TEXT PRIMARY KEY,
  "eventId"       TEXT NOT NULL,
  "faseId"        TEXT,
  "descricao"     TEXT NOT NULL,
  "responsavelId" TEXT,
  "status"        TEXT NOT NULL DEFAULT 'PENDENTE',
  "prazo"         TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "EventoMarco" (
  "id"     TEXT PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "data"   TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'FUTURO',
  "obs"    TEXT
);

CREATE TABLE IF NOT EXISTS "EventoRecurso" (
  "id"         TEXT PRIMARY KEY,
  "eventId"    TEXT NOT NULL,
  "nome"       TEXT NOT NULL,
  "quantidade" TEXT,
  "status"     TEXT NOT NULL DEFAULT 'PENDENTE'
);

CREATE TABLE IF NOT EXISTS "Midia" (
  "id"          TEXT PRIMARY KEY,
  "tenantId"    TEXT NOT NULL,
  "titulo"      TEXT NOT NULL,
  "tipo"        TEXT NOT NULL,
  "categoria"   TEXT NOT NULL,
  "url"         TEXT NOT NULL,
  "pregador"    TEXT,
  "data"        TIMESTAMP(3),
  "duracao"     TEXT,
  "reproducoes" INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CursoCategoria" (
  "id"        TEXT PRIMARY KEY,
  "tenantId"  TEXT NOT NULL,
  "nome"      TEXT NOT NULL,
  "cor"       TEXT NOT NULL DEFAULT '#1D4ED8',
  "ordem"     INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("tenantId", "nome")
);

CREATE TABLE IF NOT EXISTS "Curso" (
  "id"             TEXT PRIMARY KEY,
  "tenantId"       TEXT NOT NULL,
  "congregationId" TEXT,
  "titulo"         TEXT NOT NULL,
  "descricao"      TEXT,
  "banner"         TEXT,
  "categoria"      TEXT NOT NULL DEFAULT 'ESTUDO',
  "nivel"          TEXT NOT NULL DEFAULT 'INICIANTE',
  "publicado"      BOOLEAN NOT NULL DEFAULT false,
  "cargaHoraria"   INTEGER,
  "instrutor"      TEXT,
  "instrutorId"    TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CursoModulo" (
  "id"      TEXT PRIMARY KEY,
  "cursoId" TEXT NOT NULL,
  "titulo"  TEXT NOT NULL,
  "ordem"   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "CursoAula" (
  "id"       TEXT PRIMARY KEY,
  "moduloId" TEXT NOT NULL,
  "titulo"   TEXT NOT NULL,
  "tipo"     TEXT NOT NULL DEFAULT 'VIDEO',
  "conteudo" TEXT,
  "duracao"  TEXT,
  "ordem"    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "CursoProgresso" (
  "id"        TEXT PRIMARY KEY,
  "cursoId"   TEXT NOT NULL,
  "aulaId"    TEXT NOT NULL,
  "memberId"  TEXT NOT NULL,
  "concluido" BOOLEAN NOT NULL DEFAULT false,
  "dataHora"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("cursoId", "aulaId", "memberId")
);

CREATE TABLE IF NOT EXISTS "Culto" (
  "id"            TEXT PRIMARY KEY,
  "tenantId"      TEXT NOT NULL,
  "titulo"        TEXT NOT NULL,
  "data"          TIMESTAMP(3) NOT NULL,
  "qrCode"        TEXT UNIQUE,
  "ativo"         BOOLEAN NOT NULL DEFAULT true,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "pregadorId"    TEXT,
  "liderLouvorId" TEXT,
  "local"         TEXT,
  "tipo"          TEXT NOT NULL DEFAULT 'DOMINICAL',
  "descricao"     TEXT,
  "tema"          TEXT,
  "serie"         TEXT,
  "transmissaoUrl" TEXT,
  "congregationId" TEXT
);

CREATE TABLE IF NOT EXISTS "Checkin" (
  "id"           TEXT PRIMARY KEY,
  "cultoId"      TEXT NOT NULL,
  "tenantId"     TEXT,
  "nome"         TEXT NOT NULL,
  "tipo"         TEXT,
  "memberId"     TEXT,
  "telefone"     TEXT,
  "comoConheceu" TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Escala" (
  "id"             TEXT PRIMARY KEY,
  "tenantId"       TEXT NOT NULL,
  "congregationId" TEXT,
  "titulo"         TEXT NOT NULL,
  "data"           TIMESTAMP(3) NOT NULL,
  "ministerio"     TEXT NOT NULL,
  "observacoes"    TEXT,
  "status"         TEXT NOT NULL DEFAULT 'ATIVA',
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "EscalaMembro" (
  "id"        TEXT PRIMARY KEY,
  "escalaId"  TEXT NOT NULL,
  "memberId"  TEXT NOT NULL,
  "funcao"    TEXT NOT NULL,
  "status"    TEXT NOT NULL DEFAULT 'PENDENTE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Notification" (
  "id"        TEXT PRIMARY KEY,
  "tenantId"  TEXT,
  "userId"    TEXT,
  "title"     TEXT NOT NULL,
  "message"   TEXT,
  "type"      TEXT NOT NULL DEFAULT 'GENERAL',
  "read"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

-- ============================================================
-- 1) TABELA "Group" — adicionar colunas faltantes
-- ============================================================
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "leaderId" TEXT;
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "leaderId2" TEXT;
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "leaderId3" TEXT;
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "leaderId4" TEXT;
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "meetingDay" TEXT;
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "meetingTime" TEXT;
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "dataAbertura" TIMESTAMP(3);
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "perfil" TEXT;
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "categorias" TEXT[] DEFAULT '{}';
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "grupoOrigemId" TEXT;

-- Garantir nullable
ALTER TABLE "Group" ALTER COLUMN "leaderId" DROP NOT NULL;
ALTER TABLE "Group" ALTER COLUMN "leaderId2" DROP NOT NULL;
ALTER TABLE "Group" ALTER COLUMN "leaderId3" DROP NOT NULL;
ALTER TABLE "Group" ALTER COLUMN "leaderId4" DROP NOT NULL;
ALTER TABLE "Group" ALTER COLUMN "meetingDay" DROP NOT NULL;
ALTER TABLE "Group" ALTER COLUMN "meetingTime" DROP NOT NULL;
ALTER TABLE "Group" ALTER COLUMN "address" DROP NOT NULL;
ALTER TABLE "Group" ALTER COLUMN "dataAbertura" DROP NOT NULL;
ALTER TABLE "Group" ALTER COLUMN "perfil" DROP NOT NULL;
ALTER TABLE "Group" ALTER COLUMN "grupoOrigemId" DROP NOT NULL;
ALTER TABLE "Group" ALTER COLUMN "description" DROP NOT NULL;

-- ============================================================
-- 2) TABELA "Member"
-- ============================================================
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "baptismDate" TIMESTAMP(3);
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "cep" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "complement" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "neighborhood" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "number" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "sexo" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "estadoCivil" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "dataBatismoEspirito" TIMESTAMP(3);
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "ministerios" TEXT[] DEFAULT '{}';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "disponibilidadeDias" TEXT[] DEFAULT '{}';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "disponibilidadeTurnos" TEXT[] DEFAULT '{}';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "conjugeId" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "filhos" JSONB;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "indicadoPorId" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "comoConheceu" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "observacoesPastorais" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "portalEmail" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "portalPassword" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "portalStatus" TEXT DEFAULT 'PENDENTE';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "phone2" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "cpf" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "rg" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "escolaridade" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "pais" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "batizado" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "dataConversao" TIMESTAMP(3);
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "lgpdAceite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "congregationId" TEXT;

ALTER TABLE "Member" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "phone" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "birthDate" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "address" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "photo" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "role" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "groupId" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "baptismDate" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "cep" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "city" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "complement" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "neighborhood" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "notes" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "number" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "state" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "sexo" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "estadoCivil" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "whatsapp" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "dataBatismoEspirito" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "conjugeId" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "indicadoPorId" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "comoConheceu" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "observacoesPastorais" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "portalEmail" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "portalPassword" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "deletedAt" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "phone2" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "cpf" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "rg" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "escolaridade" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "pais" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "batizado" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "dataConversao" DROP NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "congregationId" DROP NOT NULL;

-- ============================================================
-- 3) TABELA "User"
-- ============================================================
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "memberId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "congregationId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "acceptedTermsAt" TIMESTAMP(3);

ALTER TABLE "User" ALTER COLUMN "memberId" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "congregationId" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "avatar" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "acceptedTermsAt" DROP NOT NULL;

-- ============================================================
-- 4) TABELA "Event"
-- ============================================================
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "congregationId" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "banner" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "isGratuito" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "linkExterno" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "maxVagas" INTEGER;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "recorrente" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ABERTO';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "valor" DOUBLE PRECISION;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "alimentacaoAtiva" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "alimentacaoModelo" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "avancado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "cidadeExterna" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "enderecoRetirada" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "instrucaoRetirada" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "endereco" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "googleMapsLink" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "organizadorId" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "dataFim" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "subtitulo" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "telefoneObrigatorio" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "enderecoObrigatorio" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "emailObrigatorio" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "ocultarTelefone" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "ocultarEndereco" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "formaPagamento" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "ministerioResponsavel" TEXT;

ALTER TABLE "Event" ALTER COLUMN "slug" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "valor" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "maxVagas" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "dataFim" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "organizadorId" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "linkExterno" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "alimentacaoModelo" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "cidadeExterna" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "enderecoRetirada" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "instrucaoRetirada" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "endereco" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "googleMapsLink" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "subtitulo" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "formaPagamento" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "ministerioResponsavel" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "congregationId" DROP NOT NULL;

-- ============================================================
-- 5) TABELA "Finance"
-- ============================================================
ALTER TABLE "Finance" ADD COLUMN IF NOT EXISTS "contaId" TEXT;
ALTER TABLE "Finance" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Finance" ADD COLUMN IF NOT EXISTS "memberId" TEXT;
ALTER TABLE "Finance" ADD COLUMN IF NOT EXISTS "memberName" TEXT;
ALTER TABLE "Finance" ADD COLUMN IF NOT EXISTS "metaId" TEXT;
ALTER TABLE "Finance" ADD COLUMN IF NOT EXISTS "reciboNum" TEXT;
ALTER TABLE "Finance" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE "Finance" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'CONFIRMADO';
ALTER TABLE "Finance" ADD COLUMN IF NOT EXISTS "congregationId" TEXT;

ALTER TABLE "Finance" ALTER COLUMN "contaId" DROP NOT NULL;
ALTER TABLE "Finance" ALTER COLUMN "memberId" DROP NOT NULL;
ALTER TABLE "Finance" ALTER COLUMN "memberName" DROP NOT NULL;
ALTER TABLE "Finance" ALTER COLUMN "metaId" DROP NOT NULL;
ALTER TABLE "Finance" ALTER COLUMN "reciboNum" DROP NOT NULL;
ALTER TABLE "Finance" ALTER COLUMN "paymentMethod" DROP NOT NULL;
ALTER TABLE "Finance" ALTER COLUMN "congregationId" DROP NOT NULL;

-- ============================================================
-- 6) TABELA "Culto"
-- ============================================================
ALTER TABLE "Culto" ADD COLUMN IF NOT EXISTS "qrCode" TEXT;
ALTER TABLE "Culto" ADD COLUMN IF NOT EXISTS "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Culto" ADD COLUMN IF NOT EXISTS "pregadorId" TEXT;
ALTER TABLE "Culto" ADD COLUMN IF NOT EXISTS "liderLouvorId" TEXT;
ALTER TABLE "Culto" ADD COLUMN IF NOT EXISTS "local" TEXT;
ALTER TABLE "Culto" ADD COLUMN IF NOT EXISTS "tipo" TEXT NOT NULL DEFAULT 'DOMINICAL';
ALTER TABLE "Culto" ADD COLUMN IF NOT EXISTS "descricao" TEXT;
ALTER TABLE "Culto" ADD COLUMN IF NOT EXISTS "tema" TEXT;
ALTER TABLE "Culto" ADD COLUMN IF NOT EXISTS "serie" TEXT;
ALTER TABLE "Culto" ADD COLUMN IF NOT EXISTS "transmissaoUrl" TEXT;
ALTER TABLE "Culto" ADD COLUMN IF NOT EXISTS "congregationId" TEXT;

ALTER TABLE "Culto" ALTER COLUMN "qrCode" DROP NOT NULL;
ALTER TABLE "Culto" ALTER COLUMN "pregadorId" DROP NOT NULL;
ALTER TABLE "Culto" ALTER COLUMN "liderLouvorId" DROP NOT NULL;
ALTER TABLE "Culto" ALTER COLUMN "local" DROP NOT NULL;
ALTER TABLE "Culto" ALTER COLUMN "descricao" DROP NOT NULL;
ALTER TABLE "Culto" ALTER COLUMN "tema" DROP NOT NULL;
ALTER TABLE "Culto" ALTER COLUMN "serie" DROP NOT NULL;
ALTER TABLE "Culto" ALTER COLUMN "transmissaoUrl" DROP NOT NULL;
ALTER TABLE "Culto" ALTER COLUMN "congregationId" DROP NOT NULL;

-- ============================================================
-- 7) TABELA "Escala"
-- ============================================================
ALTER TABLE "Escala" ADD COLUMN IF NOT EXISTS "congregationId" TEXT;
ALTER TABLE "Escala" ADD COLUMN IF NOT EXISTS "observacoes" TEXT;
ALTER TABLE "Escala" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ATIVA';

ALTER TABLE "Escala" ALTER COLUMN "congregationId" DROP NOT NULL;
ALTER TABLE "Escala" ALTER COLUMN "observacoes" DROP NOT NULL;

-- ============================================================
-- 8) TABELA "Aviso"
-- ============================================================
ALTER TABLE "Aviso" ADD COLUMN IF NOT EXISTS "congregationId" TEXT;
ALTER TABLE "Aviso" ADD COLUMN IF NOT EXISTS "authorId" TEXT;
ALTER TABLE "Aviso" ADD COLUMN IF NOT EXISTS "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Aviso" ADD COLUMN IF NOT EXISTS "dataFim" TIMESTAMP(3);
ALTER TABLE "Aviso" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Aviso" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Aviso" ALTER COLUMN "congregationId" DROP NOT NULL;
ALTER TABLE "Aviso" ALTER COLUMN "authorId" DROP NOT NULL;
ALTER TABLE "Aviso" ALTER COLUMN "dataFim" DROP NOT NULL;

-- ============================================================
-- 9) TABELA "Patrimonio"
-- ============================================================
ALTER TABLE "Patrimonio" ADD COLUMN IF NOT EXISTS "descricao" TEXT;
ALTER TABLE "Patrimonio" ADD COLUMN IF NOT EXISTS "categoria" TEXT;
ALTER TABLE "Patrimonio" ADD COLUMN IF NOT EXISTS "localizacao" TEXT;
ALTER TABLE "Patrimonio" ADD COLUMN IF NOT EXISTS "dataAquisicao" TIMESTAMP(3);
ALTER TABLE "Patrimonio" ADD COLUMN IF NOT EXISTS "valor" DOUBLE PRECISION;
ALTER TABLE "Patrimonio" ADD COLUMN IF NOT EXISTS "estado" TEXT NOT NULL DEFAULT 'NOVO';
ALTER TABLE "Patrimonio" ADD COLUMN IF NOT EXISTS "responsavelId" TEXT;
ALTER TABLE "Patrimonio" ADD COLUMN IF NOT EXISTS "qrCode" TEXT;
ALTER TABLE "Patrimonio" ADD COLUMN IF NOT EXISTS "foto" TEXT;
ALTER TABLE "Patrimonio" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Patrimonio" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Patrimonio" ALTER COLUMN "descricao" DROP NOT NULL;
ALTER TABLE "Patrimonio" ALTER COLUMN "categoria" DROP NOT NULL;
ALTER TABLE "Patrimonio" ALTER COLUMN "localizacao" DROP NOT NULL;
ALTER TABLE "Patrimonio" ALTER COLUMN "dataAquisicao" DROP NOT NULL;
ALTER TABLE "Patrimonio" ALTER COLUMN "valor" DROP NOT NULL;
ALTER TABLE "Patrimonio" ALTER COLUMN "responsavelId" DROP NOT NULL;
ALTER TABLE "Patrimonio" ALTER COLUMN "qrCode" DROP NOT NULL;
ALTER TABLE "Patrimonio" ALTER COLUMN "foto" DROP NOT NULL;

-- ============================================================
-- 10) TABELA "Curso"
-- ============================================================
ALTER TABLE "Curso" ADD COLUMN IF NOT EXISTS "congregationId" TEXT;
ALTER TABLE "Curso" ADD COLUMN IF NOT EXISTS "banner" TEXT;
ALTER TABLE "Curso" ADD COLUMN IF NOT EXISTS "categoria" TEXT NOT NULL DEFAULT 'ESTUDO';
ALTER TABLE "Curso" ADD COLUMN IF NOT EXISTS "nivel" TEXT NOT NULL DEFAULT 'INICIANTE';
ALTER TABLE "Curso" ADD COLUMN IF NOT EXISTS "publicado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Curso" ADD COLUMN IF NOT EXISTS "cargaHoraria" INTEGER;
ALTER TABLE "Curso" ADD COLUMN IF NOT EXISTS "instrutor" TEXT;
ALTER TABLE "Curso" ADD COLUMN IF NOT EXISTS "instrutorId" TEXT;

ALTER TABLE "Curso" ALTER COLUMN "congregationId" DROP NOT NULL;
ALTER TABLE "Curso" ALTER COLUMN "banner" DROP NOT NULL;
ALTER TABLE "Curso" ALTER COLUMN "cargaHoraria" DROP NOT NULL;
ALTER TABLE "Curso" ALTER COLUMN "instrutor" DROP NOT NULL;
ALTER TABLE "Curso" ALTER COLUMN "instrutorId" DROP NOT NULL;

-- ============================================================
-- 11) TABELA "Produto"
-- ============================================================
ALTER TABLE "Produto" ADD COLUMN IF NOT EXISTS "foto" TEXT;
ALTER TABLE "Produto" ADD COLUMN IF NOT EXISTS "estoque" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Produto" ADD COLUMN IF NOT EXISTS "ativo" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Produto" ALTER COLUMN "foto" DROP NOT NULL;

-- ============================================================
-- 12) TABELA "Pedido"
-- ============================================================
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "memberId" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "telefone" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "formaPagamento" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "lancamentoId" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "eventId" TEXT;

ALTER TABLE "Pedido" ALTER COLUMN "memberId" DROP NOT NULL;
ALTER TABLE "Pedido" ALTER COLUMN "telefone" DROP NOT NULL;
ALTER TABLE "Pedido" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "Pedido" ALTER COLUMN "formaPagamento" DROP NOT NULL;
ALTER TABLE "Pedido" ALTER COLUMN "lancamentoId" DROP NOT NULL;
ALTER TABLE "Pedido" ALTER COLUMN "eventId" DROP NOT NULL;

-- ============================================================
-- 13) TABELA "Tenant"
-- ============================================================
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "logo" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "primaryColor" TEXT NOT NULL DEFAULT '#1A3C6E';
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "secondaryColor" TEXT NOT NULL DEFAULT '#C8922A';
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "domain" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "isWhiteLabel" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "maxChurches" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "resellerId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "customDomain" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "customName" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "stripePriceId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- 14) TABELA "Inscricao"
-- ============================================================
ALTER TABLE "Inscricao" ADD COLUMN IF NOT EXISTS "tipo" TEXT NOT NULL DEFAULT 'MEMBRO';
ALTER TABLE "Inscricao" ADD COLUMN IF NOT EXISTS "memberId" TEXT;
ALTER TABLE "Inscricao" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'CONFIRMADO';
ALTER TABLE "Inscricao" ADD COLUMN IF NOT EXISTS "qrCode" TEXT;
ALTER TABLE "Inscricao" ADD COLUMN IF NOT EXISTS "checkinAt" TIMESTAMP(3);
ALTER TABLE "Inscricao" ADD COLUMN IF NOT EXISTS "formaPagamento" TEXT;
ALTER TABLE "Inscricao" ADD COLUMN IF NOT EXISTS "lancamentoId" TEXT;
ALTER TABLE "Inscricao" ADD COLUMN IF NOT EXISTS "pagamentoStatus" TEXT NOT NULL DEFAULT 'PENDENTE';

ALTER TABLE "Inscricao" ALTER COLUMN "telefone" DROP NOT NULL;
ALTER TABLE "Inscricao" ALTER COLUMN "memberId" DROP NOT NULL;
ALTER TABLE "Inscricao" ALTER COLUMN "qrCode" DROP NOT NULL;
ALTER TABLE "Inscricao" ALTER COLUMN "checkinAt" DROP NOT NULL;
ALTER TABLE "Inscricao" ALTER COLUMN "formaPagamento" DROP NOT NULL;
ALTER TABLE "Inscricao" ALTER COLUMN "lancamentoId" DROP NOT NULL;

-- ============================================================
-- 15) TABELA "Checkin"
-- ============================================================
ALTER TABLE "Checkin" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Checkin" ADD COLUMN IF NOT EXISTS "tipo" TEXT;
ALTER TABLE "Checkin" ADD COLUMN IF NOT EXISTS "memberId" TEXT;
ALTER TABLE "Checkin" ADD COLUMN IF NOT EXISTS "telefone" TEXT;
ALTER TABLE "Checkin" ADD COLUMN IF NOT EXISTS "comoConheceu" TEXT;

ALTER TABLE "Checkin" ALTER COLUMN "tenantId" DROP NOT NULL;
ALTER TABLE "Checkin" ALTER COLUMN "memberId" DROP NOT NULL;
ALTER TABLE "Checkin" ALTER COLUMN "telefone" DROP NOT NULL;
ALTER TABLE "Checkin" ALTER COLUMN "comoConheceu" DROP NOT NULL;

-- ============================================================
-- 16) TABELA "Midia"
-- ============================================================
ALTER TABLE "Midia" ADD COLUMN IF NOT EXISTS "pregador" TEXT;
ALTER TABLE "Midia" ADD COLUMN IF NOT EXISTS "data" TIMESTAMP(3);
ALTER TABLE "Midia" ADD COLUMN IF NOT EXISTS "duracao" TEXT;
ALTER TABLE "Midia" ADD COLUMN IF NOT EXISTS "reproducoes" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Midia" ALTER COLUMN "pregador" DROP NOT NULL;
ALTER TABLE "Midia" ALTER COLUMN "data" DROP NOT NULL;
ALTER TABLE "Midia" ALTER COLUMN "duracao" DROP NOT NULL;

-- ============================================================
-- 17) TABELA "Cupom"
-- ============================================================
ALTER TABLE "Cupom" ADD COLUMN IF NOT EXISTS "maxUsos" INTEGER;
ALTER TABLE "Cupom" ADD COLUMN IF NOT EXISTS "usosAtual" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Cupom" ADD COLUMN IF NOT EXISTS "validade" TIMESTAMP(3);
ALTER TABLE "Cupom" ADD COLUMN IF NOT EXISTS "ativo" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Cupom" ALTER COLUMN "maxUsos" DROP NOT NULL;
ALTER TABLE "Cupom" ALTER COLUMN "validade" DROP NOT NULL;

-- ============================================================
-- 18) TABELA "Notification"
-- ============================================================
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "message" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "read" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Notification" ALTER COLUMN "tenantId" DROP NOT NULL;
ALTER TABLE "Notification" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Notification" ALTER COLUMN "message" DROP NOT NULL;

-- ============================================================
-- 19) TABELA "ContaBancaria"
-- ============================================================
ALTER TABLE "ContaBancaria" ADD COLUMN IF NOT EXISTS "banco" TEXT;
ALTER TABLE "ContaBancaria" ADD COLUMN IF NOT EXISTS "agencia" TEXT;
ALTER TABLE "ContaBancaria" ADD COLUMN IF NOT EXISTS "numeroConta" TEXT;
ALTER TABLE "ContaBancaria" ADD COLUMN IF NOT EXISTS "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "ContaBancaria" ADD COLUMN IF NOT EXISTS "isAtiva" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "ContaBancaria" ALTER COLUMN "banco" DROP NOT NULL;
ALTER TABLE "ContaBancaria" ALTER COLUMN "agencia" DROP NOT NULL;
ALTER TABLE "ContaBancaria" ALTER COLUMN "numeroConta" DROP NOT NULL;

-- ============================================================
-- 20) TABELA "Meta"
-- ============================================================
ALTER TABLE "Meta" ADD COLUMN IF NOT EXISTS "descricao" TEXT;
ALTER TABLE "Meta" ADD COLUMN IF NOT EXISTS "valorAtual" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Meta" ADD COLUMN IF NOT EXISTS "dataFim" TIMESTAMP(3);
ALTER TABLE "Meta" ADD COLUMN IF NOT EXISTS "isAtiva" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Meta" ALTER COLUMN "descricao" DROP NOT NULL;
ALTER TABLE "Meta" ALTER COLUMN "dataFim" DROP NOT NULL;

-- ============================================================
-- 21) TABELA "AuditLog"
-- ============================================================
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "targetId" TEXT;

ALTER TABLE "AuditLog" ALTER COLUMN "tenantId" DROP NOT NULL;
ALTER TABLE "AuditLog" ALTER COLUMN "userId" DROP NOT NULL;

-- ============================================================
-- 22) TABELA "GroupFrequencia"
-- ============================================================
ALTER TABLE "GroupFrequencia" ADD COLUMN IF NOT EXISTS "presentes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "GroupFrequencia" ADD COLUMN IF NOT EXISTS "ausentes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "GroupFrequencia" ADD COLUMN IF NOT EXISTS "visitantes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "GroupFrequencia" ADD COLUMN IF NOT EXISTS "observacao" TEXT;

ALTER TABLE "GroupFrequencia" ALTER COLUMN "observacao" DROP NOT NULL;

-- ============================================================
-- 23) Índices para Congregation
-- ============================================================
CREATE INDEX IF NOT EXISTS "Congregation_tenantId_idx" ON "Congregation"("tenantId");
CREATE INDEX IF NOT EXISTS "Congregation_tenantId_deletedAt_idx" ON "Congregation"("tenantId", "deletedAt");

-- ============================================================
-- 24) Foreign Keys (com guard para não duplicar)
-- ============================================================
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

DO $$ BEGIN
  ALTER TABLE "User"
    ADD CONSTRAINT "User_congregationId_fkey"
    FOREIGN KEY ("congregationId") REFERENCES "Congregation"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- FIM DO SQL v2
-- ============================================================
