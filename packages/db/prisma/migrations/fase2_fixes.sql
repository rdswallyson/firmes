node.exe : warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please 
migrate to a Prisma config file (e.g., `prisma.config.ts`).
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (warn The config...ma.config.ts`).:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
For more information, see: https://pris.ly/prisma-config

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRATA', 'OURO', 'DIAMANTE', 'ESMERALDA_STARTER', 'ESMERALDA_PRO', 'ESMERALDA_PLUS', 'ESMERALDA_ULTRA');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1A3C6E',
    "secondaryColor" TEXT NOT NULL DEFAULT '#C8922A',
    "domain" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "isWhiteLabel" BOOLEAN NOT NULL DEFAULT false,
    "maxChurches" INTEGER NOT NULL DEFAULT 1,
    "resellerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customDomain" TEXT,
    "customName" TEXT,
    "stripeCustomerId" TEXT,
    "stripePriceId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "tenantId" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedTermsAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "address" TEXT,
    "photo" TEXT,
    "memberSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "role" TEXT,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baptismDate" TIMESTAMP(3),
    "cep" TEXT,
    "city" TEXT,
    "complement" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "neighborhood" TEXT,
    "notes" TEXT,
    "number" TEXT,
    "state" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sexo" TEXT,
    "estadoCivil" TEXT,
    "whatsapp" TEXT,
    "dataBatismoEspirito" TIMESTAMP(3),
    "ministerios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "disponibilidadeDias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "disponibilidadeTurnos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "conjugeId" TEXT,
    "filhos" JSONB,
    "indicadoPorId" TEXT,
    "comoConheceu" TEXT,
    "observacoesPastorais" TEXT,
    "portalEmail" TEXT,
    "portalPassword" TEXT,
    "portalStatus" TEXT DEFAULT 'PENDENTE',
    "deletedAt" TIMESTAMP(3),
    "phone2" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "escolaridade" TEXT,
    "pais" TEXT,
    "batizado" TEXT,
    "dataConversao" TIMESTAMP(3),
    "lgpdAceite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "leaderId" TEXT,
    "leaderId2" TEXT,
    "leaderId3" TEXT,
    "leaderId4" TEXT,
    "meetingDay" TEXT,
    "meetingTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT,
    "dataAbertura" TIMESTAMP(3),
    "perfil" TEXT,
    "categorias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "grupoOrigemId" TEXT,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupFrequencia" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "presentes" INTEGER NOT NULL DEFAULT 0,
    "ausentes" INTEGER NOT NULL DEFAULT 0,
    "visitantes" INTEGER NOT NULL DEFAULT 0,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupFrequencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "banner" TEXT,
    "isGratuito" BOOLEAN NOT NULL DEFAULT true,
    "linkExterno" TEXT,
    "maxVagas" INTEGER,
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "valor" DOUBLE PRECISION,
    "alimentacaoAtiva" BOOLEAN NOT NULL DEFAULT false,
    "alimentacaoModelo" TEXT,
    "avancado" BOOLEAN NOT NULL DEFAULT false,
    "cidadeExterna" TEXT,
    "enderecoRetirada" TEXT,
    "instrucaoRetirada" TEXT,
    "endereco" TEXT,
    "googleMapsLink" TEXT,
    "organizadorId" TEXT,
    "dataFim" TIMESTAMP(3),
    "subtitulo" TEXT,
    "telefoneObrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "enderecoObrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "emailObrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "ocultarTelefone" BOOLEAN NOT NULL DEFAULT false,
    "ocultarEndereco" BOOLEAN NOT NULL DEFAULT false,
    "formaPagamento" TEXT,
    "ministerioResponsavel" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscricao" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'MEMBRO',
    "memberId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMADO',
    "qrCode" TEXT NOT NULL,
    "checkinAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formaPagamento" TEXT,
    "lancamentoId" TEXT,
    "pagamentoStatus" TEXT NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "Inscricao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contaId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "memberId" TEXT,
    "memberName" TEXT,
    "metaId" TEXT,
    "reciboNum" TEXT,
    "paymentMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMADO',

    CONSTRAINT "Finance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaBancaria" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "banco" TEXT,
    "agencia" TEXT,
    "numeroConta" TEXT,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isAtiva" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaBancaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meta" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "valorMeta" DOUBLE PRECISION NOT NULL,
    "valorAtual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dataFim" TIMESTAMP(3),
    "isAtiva" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aviso" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patrimonio" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "localizacao" TEXT,
    "dataAquisicao" TIMESTAMP(3),
    "valor" DOUBLE PRECISION,
    "estado" TEXT NOT NULL DEFAULT 'NOVO',
    "responsavelId" TEXT,
    "qrCode" TEXT,
    "foto" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patrimonio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoRefeicao" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "emoji" TEXT,
    "modelo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION,
    "dias" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EventoRefeicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscricaoRefeicao" (
    "id" TEXT NOT NULL,
    "inscricaoId" TEXT NOT NULL,
    "refeicaoId" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "usadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InscricaoRefeicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoCheckinPonto" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EventoCheckinPonto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoCheckinScan" (
    "id" TEXT NOT NULL,
    "pontoId" TEXT NOT NULL,
    "inscricaoId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valido" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EventoCheckinScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "foto" TEXT,
    "preco" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoVariacao" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "opcao" TEXT NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProdutoVariacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "memberId" TEXT,
    "nomeComprador" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "formaPagamento" TEXT,
    "total" DOUBLE PRECISION NOT NULL,
    "lancamentoId" TEXT,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoItem" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "variacaoId" TEXT,
    "quantidade" INTEGER NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "entregue" BOOLEAN NOT NULL DEFAULT false,
    "entregueEm" TIMESTAMP(3),

    CONSTRAINT "PedidoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscricaoPedidoItem" (
    "id" TEXT NOT NULL,
    "inscricaoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "variacaoId" TEXT,
    "quantidade" INTEGER NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "entregue" BOOLEAN NOT NULL DEFAULT false,
    "entregueEm" TIMESTAMP(3),

    CONSTRAINT "InscricaoPedidoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoProduto" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,

    CONSTRAINT "EventoProduto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cupom" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "desconto" DOUBLE PRECISION NOT NULL,
    "tipo" TEXT NOT NULL,
    "maxUsos" INTEGER,
    "usosAtual" INTEGER NOT NULL DEFAULT 0,
    "validade" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Cupom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoFase" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),

    CONSTRAINT "EventoFase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoEquipe" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "responsavelId" TEXT,

    CONSTRAINT "EventoEquipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoMembro" (
    "id" TEXT NOT NULL,
    "equipeId" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "funcaoSpec" TEXT,

    CONSTRAINT "EventoMembro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoChecklist" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "faseId" TEXT,
    "descricao" TEXT NOT NULL,
    "responsavelId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "prazo" TIMESTAMP(3),

    CONSTRAINT "EventoChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoMarco" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'FUTURO',
    "obs" TEXT,

    CONSTRAINT "EventoMarco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoRecurso" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "EventoRecurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Midia" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pregador" TEXT,
    "data" TIMESTAMP(3),
    "duracao" TEXT,
    "reproducoes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Midia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CursoCategoria" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#1D4ED8',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CursoCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "banner" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'ESTUDO',
    "nivel" TEXT NOT NULL DEFAULT 'INICIANTE',
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "cargaHoraria" INTEGER,
    "instrutor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CursoModulo" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CursoModulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CursoAula" (
    "id" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'VIDEO',
    "conteudo" TEXT,
    "duracao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CursoAula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CursoProgresso" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CursoProgresso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Culto" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "qrCode" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pregadorId" TEXT,
    "liderLouvorId" TEXT,
    "local" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'DOMINICAL',
    "descricao" TEXT,
    "tema" TEXT,
    "serie" TEXT,
    "transmissaoUrl" TEXT,

    CONSTRAINT "Culto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkin" (
    "id" TEXT NOT NULL,
    "cultoId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "memberId" TEXT,
    "telefone" TEXT,
    "comoConheceu" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escala" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "ministerio" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Escala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalaMembro" (
    "id" TEXT NOT NULL,
    "escalaId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EscalaMembro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Member_tenantId_idx" ON "Member"("tenantId");

-- CreateIndex
CREATE INDEX "Member_tenantId_status_idx" ON "Member"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Member_tenantId_groupId_idx" ON "Member"("tenantId", "groupId");

-- CreateIndex
CREATE INDEX "Member_name_idx" ON "Member"("name");

-- CreateIndex
CREATE INDEX "Member_email_idx" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_birthDate_idx" ON "Member"("birthDate");

-- CreateIndex
CREATE INDEX "Member_portalStatus_idx" ON "Member"("portalStatus");

-- CreateIndex
CREATE INDEX "Group_tenantId_idx" ON "Group"("tenantId");

-- CreateIndex
CREATE INDEX "Group_tenantId_isActive_idx" ON "Group"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "Group_leaderId_idx" ON "Group"("leaderId");

-- CreateIndex
CREATE INDEX "Group_leaderId2_idx" ON "Group"("leaderId2");

-- CreateIndex
CREATE INDEX "Group_leaderId3_idx" ON "Group"("leaderId3");

-- CreateIndex
CREATE INDEX "Group_leaderId4_idx" ON "Group"("leaderId4");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_memberId_key" ON "GroupMember"("groupId", "memberId");

-- CreateIndex
CREATE INDEX "GroupFrequencia_groupId_date_idx" ON "GroupFrequencia"("groupId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_tenantId_idx" ON "Event"("tenantId");

-- CreateIndex
CREATE INDEX "Event_tenantId_date_idx" ON "Event"("tenantId", "date");

-- CreateIndex
CREATE INDEX "Event_tenantId_status_idx" ON "Event"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_organizadorId_idx" ON "Event"("organizadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Inscricao_qrCode_key" ON "Inscricao"("qrCode");

-- CreateIndex
CREATE INDEX "Inscricao_tenantId_idx" ON "Inscricao"("tenantId");

-- CreateIndex
CREATE INDEX "Inscricao_eventId_idx" ON "Inscricao"("eventId");

-- CreateIndex
CREATE INDEX "Inscricao_tenantId_status_idx" ON "Inscricao"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Inscricao_qrCode_idx" ON "Inscricao"("qrCode");

-- CreateIndex
CREATE INDEX "Finance_tenantId_idx" ON "Finance"("tenantId");

-- CreateIndex
CREATE INDEX "Finance_tenantId_createdAt_idx" ON "Finance"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Finance_tenantId_type_idx" ON "Finance"("tenantId", "type");

-- CreateIndex
CREATE INDEX "Finance_tenantId_status_idx" ON "Finance"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Finance_memberId_idx" ON "Finance"("memberId");

-- CreateIndex
CREATE INDEX "ContaBancaria_tenantId_idx" ON "ContaBancaria"("tenantId");

-- CreateIndex
CREATE INDEX "Meta_tenantId_idx" ON "Meta"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "Aviso_tenantId_idx" ON "Aviso"("tenantId");

-- CreateIndex
CREATE INDEX "Aviso_tenantId_pinned_idx" ON "Aviso"("tenantId", "pinned");

-- CreateIndex
CREATE INDEX "Aviso_dataInicio_idx" ON "Aviso"("dataInicio");

-- CreateIndex
CREATE INDEX "Aviso_dataFim_idx" ON "Aviso"("dataFim");

-- CreateIndex
CREATE UNIQUE INDEX "Patrimonio_qrCode_key" ON "Patrimonio"("qrCode");

-- CreateIndex
CREATE INDEX "Patrimonio_tenantId_idx" ON "Patrimonio"("tenantId");

-- CreateIndex
CREATE INDEX "Patrimonio_tenantId_categoria_idx" ON "Patrimonio"("tenantId", "categoria");

-- CreateIndex
CREATE INDEX "Patrimonio_tenantId_estado_idx" ON "Patrimonio"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "Patrimonio_tenantId_isActive_idx" ON "Patrimonio"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "InscricaoRefeicao_inscricaoId_refeicaoId_dia_key" ON "InscricaoRefeicao"("inscricaoId", "refeicaoId", "dia");

-- CreateIndex
CREATE UNIQUE INDEX "EventoCheckinPonto_qrToken_key" ON "EventoCheckinPonto"("qrToken");

-- CreateIndex
CREATE INDEX "Produto_tenantId_idx" ON "Produto"("tenantId");

-- CreateIndex
CREATE INDEX "Produto_tenantId_ativo_idx" ON "Produto"("tenantId", "ativo");

-- CreateIndex
CREATE INDEX "Produto_tenantId_nome_idx" ON "Produto"("tenantId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Cupom_codigo_key" ON "Cupom"("codigo");

-- CreateIndex
CREATE INDEX "Cupom_tenantId_idx" ON "Cupom"("tenantId");

-- CreateIndex
CREATE INDEX "Midia_tenantId_idx" ON "Midia"("tenantId");

-- CreateIndex
CREATE INDEX "Midia_tenantId_tipo_idx" ON "Midia"("tenantId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "CursoCategoria_tenantId_nome_key" ON "CursoCategoria"("tenantId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "CursoProgresso_cursoId_aulaId_memberId_key" ON "CursoProgresso"("cursoId", "aulaId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Culto_qrCode_key" ON "Culto"("qrCode");

-- CreateIndex
CREATE INDEX "Culto_tenantId_idx" ON "Culto"("tenantId");

-- CreateIndex
CREATE INDEX "Culto_tenantId_data_idx" ON "Culto"("tenantId", "data");

-- CreateIndex
CREATE INDEX "Culto_tenantId_ativo_idx" ON "Culto"("tenantId", "ativo");

-- CreateIndex
CREATE INDEX "Culto_pregadorId_idx" ON "Culto"("pregadorId");

-- CreateIndex
CREATE INDEX "Culto_liderLouvorId_idx" ON "Culto"("liderLouvorId");

-- CreateIndex
CREATE INDEX "Checkin_tenantId_idx" ON "Checkin"("tenantId");

-- CreateIndex
CREATE INDEX "Checkin_cultoId_idx" ON "Checkin"("cultoId");

-- CreateIndex
CREATE INDEX "Checkin_tenantId_tipo_idx" ON "Checkin"("tenantId", "tipo");

-- CreateIndex
CREATE INDEX "Escala_tenantId_idx" ON "Escala"("tenantId");

-- CreateIndex
CREATE INDEX "Escala_tenantId_data_idx" ON "Escala"("tenantId", "data");

-- CreateIndex
CREATE INDEX "Escala_tenantId_ministerio_idx" ON "Escala"("tenantId", "ministerio");

-- CreateIndex
CREATE INDEX "EscalaMembro_escalaId_idx" ON "EscalaMembro"("escalaId");

-- CreateIndex
CREATE INDEX "EscalaMembro_memberId_idx" ON "EscalaMembro"("memberId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_idx" ON "Notification"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_read_idx" ON "Notification"("tenantId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_leaderId2_fkey" FOREIGN KEY ("leaderId2") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_leaderId3_fkey" FOREIGN KEY ("leaderId3") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_leaderId4_fkey" FOREIGN KEY ("leaderId4") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupFrequencia" ADD CONSTRAINT "GroupFrequencia_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizadorId_fkey" FOREIGN KEY ("organizadorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finance" ADD CONSTRAINT "Finance_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "ContaBancaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finance" ADD CONSTRAINT "Finance_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "Meta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finance" ADD CONSTRAINT "Finance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finance" ADD CONSTRAINT "Finance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaBancaria" ADD CONSTRAINT "ContaBancaria_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meta" ADD CONSTRAINT "Meta_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aviso" ADD CONSTRAINT "Aviso_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patrimonio" ADD CONSTRAINT "Patrimonio_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoRefeicao" ADD CONSTRAINT "EventoRefeicao_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscricaoRefeicao" ADD CONSTRAINT "InscricaoRefeicao_inscricaoId_fkey" FOREIGN KEY ("inscricaoId") REFERENCES "Inscricao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscricaoRefeicao" ADD CONSTRAINT "InscricaoRefeicao_refeicaoId_fkey" FOREIGN KEY ("refeicaoId") REFERENCES "EventoRefeicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoCheckinPonto" ADD CONSTRAINT "EventoCheckinPonto_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoCheckinScan" ADD CONSTRAINT "EventoCheckinScan_inscricaoId_fkey" FOREIGN KEY ("inscricaoId") REFERENCES "Inscricao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoCheckinScan" ADD CONSTRAINT "EventoCheckinScan_pontoId_fkey" FOREIGN KEY ("pontoId") REFERENCES "EventoCheckinPonto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoVariacao" ADD CONSTRAINT "ProdutoVariacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscricaoPedidoItem" ADD CONSTRAINT "InscricaoPedidoItem_inscricaoId_fkey" FOREIGN KEY ("inscricaoId") REFERENCES "Inscricao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoProduto" ADD CONSTRAINT "EventoProduto_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoProduto" ADD CONSTRAINT "EventoProduto_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cupom" ADD CONSTRAINT "Cupom_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoFase" ADD CONSTRAINT "EventoFase_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoEquipe" ADD CONSTRAINT "EventoEquipe_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoMembro" ADD CONSTRAINT "EventoMembro_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "EventoEquipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoChecklist" ADD CONSTRAINT "EventoChecklist_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoMarco" ADD CONSTRAINT "EventoMarco_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoRecurso" ADD CONSTRAINT "EventoRecurso_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Midia" ADD CONSTRAINT "Midia_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoModulo" ADD CONSTRAINT "CursoModulo_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoAula" ADD CONSTRAINT "CursoAula_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "CursoModulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoProgresso" ADD CONSTRAINT "CursoProgresso_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoProgresso" ADD CONSTRAINT "CursoProgresso_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "CursoAula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoProgresso" ADD CONSTRAINT "CursoProgresso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Culto" ADD CONSTRAINT "Culto_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Culto" ADD CONSTRAINT "Culto_pregadorId_fkey" FOREIGN KEY ("pregadorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Culto" ADD CONSTRAINT "Culto_liderLouvorId_fkey" FOREIGN KEY ("liderLouvorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_cultoId_fkey" FOREIGN KEY ("cultoId") REFERENCES "Culto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escala" ADD CONSTRAINT "Escala_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalaMembro" ADD CONSTRAINT "EscalaMembro_escalaId_fkey" FOREIGN KEY ("escalaId") REFERENCES "Escala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalaMembro" ADD CONSTRAINT "EscalaMembro_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

