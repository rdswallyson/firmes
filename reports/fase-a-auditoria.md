# FIRMES — Relatório de Auditoria: Dependências e Escalabilidade

Data: 2026-05-23

## Resumo Executivo

O FIRMES é uma plataforma SaaS B2B para gestão de igrejas com stack Next.js + Prisma + Supabase. A auditoria revelou **problemas críticos de segurança multi-tenant** em múltiplas APIs que não filtram por `tenantId`, permitindo vazamento de dados entre igrejas. O schema `Member` está incompleto para os módulos que consomem dados de pessoas. O connection pooling do Prisma não está configurado corretamente para ambiente serverless (sem `directUrl`). A maioria das listagens não implementa paginação, o que causará lentidão com volume. Não há RLS policies no Supabase. O middleware de autenticação está funcional mas as APIs de eventos e inscrições têm falhas graves de isolamento.

---

## 1. Módulos Encontrados

| Módulo | Status | Arquivos Principais |
|--------|--------|---------------------|
| Dashboard | ⚠️ Parcial | `app/(app)/dashboard/page.tsx`, `app/api/dashboard/stats/route.ts`, `app/api/dashboard/activity/route.ts` |
| Cadastro de Membros | ⚠️ Parcial | `app/(app)/pessoas/page.tsx`, `app/api/members/route.ts`, `app/components/MemberForm.tsx` |
| Check-in de Culto | ✅ Completo | `app/(app)/cultos/page.tsx`, `app/api/cultos/route.ts`, `app/api/checkin/[id]/route.ts` |
| Financeiro | ⚠️ Parcial | `app/(app)/financeiro/page.tsx`, `app/api/financeiro/route.ts`, `app/api/financeiro/metas/route.ts` |
| Eventos | ⚠️ Parcial | `app/(app)/eventos/page.tsx`, `app/api/eventos/route.ts`, `app/api/inscricoes/route.ts` |
| EBD / Ensino | ✅ Completo | `app/(app)/ensino/page.tsx`, `app/api/ensino/route.ts`, `app/api/ensino/[id]/progresso/route.ts` |
| Células / Grupos | ✅ Completo | `app/(app)/grupos/page.tsx`, `app/api/grupos/route.ts`, `app/api/grupos/[id]/frequencia/route.ts` |
| Comunicados | ⚠️ Parcial | `app/(app)/comunicacao/page.tsx`, `app/api/comunicacao/route.ts` (não existe) |
| Loja Pública | ⚠️ Parcial | `app/(app)/vendas/page.tsx`, `app/api/loja/[slug]/route.ts`, `app/api/produtos/route.ts` |
| Escala de Ministério | ⚠️ Parcial | `app/(app)/escalas/page.tsx`, `app/api/escalas/route.ts` |
| Pedidos de Oração | ❌ Não implementado | Não encontrado |
| Relatórios | ⚠️ Parcial | `app/api/cron/relatorio-anual/route.ts` (cron job apenas) |
| Super Admin | ✅ Completo | `app/(app)/superadmin/page.tsx`, `app/api/superadmin/*/route.ts` |
| White Label / Revenda | ⚠️ Parcial | `app/(app)/white-label/page.tsx`, `app/api/stripe/checkout/route.ts` |
| Configurações | ⚠️ Parcial | `app/(app)/configuracoes/page.tsx`, `app/api/tenant/route.ts` |
| Mídias | ⚠️ Parcial | `app/(app)/midias/page.tsx`, `app/api/midias/route.ts` |
| Patrimônio | ⚠️ Parcial | `app/(app)/patrimonio/page.tsx`, `app/api/patrimonio/route.ts` |
| Avisos | ⚠️ Parcial | `app/(app)/avisos/page.tsx`, `app/api/avisos/route.ts` (não existe) |

---

## 2. Estado Atual do Model Member

### 2.1 Campos do Model Member (schema.prisma)

```
model Member {
  id            String    @id @default(cuid())
  tenantId      String
  name          String
  email         String?
  phone         String?
  photo         String?
  status        String    @default("ACTIVE")
  role          String    @default("MEMBRO")
  birthDate     DateTime?
  memberSince   DateTime?
  isActive      Boolean   @default(true)
  groupId       String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 2.2 Checklist de Campos (existe / falta / nome diferente)

| Campo | Status | Observação |
|-------|--------|------------|
| id único | ✅ existe | `@id @default(cuid())` |
| tenantId (multi-tenant) | ✅ existe | FK para Tenant |
| nomeCompleto / name | ✅ existe | Campo `name` |
| fotoPerfil / avatar / photo | ✅ existe | Campo `photo` |
| dataNascimento / birthDate | ✅ existe | Campo `birthDate` |
| sexo / gender | ❌ falta | Não existe no schema |
| estadoCivil | ❌ falta | Não existe no schema |
| conjugeId (self-reference) | ❌ falta | Não existe no schema |
| filhos / children | ❌ falta | Não existe no schema |
| telefone / phone | ✅ existe | Campo `phone` |
| whatsapp | ❌ falta | Não existe (usa `phone`) |
| email | ✅ existe | Campo `email` |
| endereço completo (cep, logradouro, bairro, cidade, estado) | ❌ falta | Não existe no schema |
| statusMembro (ativo/inativo/visitante) | ⚠️ existe com nome diferente | Campo `status` com valores "ACTIVE" / "INACTIVE" |
| dataIngresso | ⚠️ existe com nome diferente | Campo `memberSince` |
| dataBatismoAguas | ❌ falta | Não existe no schema |
| dataBatismoEspirito | ❌ falta | Não existe no schema |
| funcaoNaIgreja (pastor/diácono/líder) | ⚠️ existe com nome diferente | Campo `role` com valores "MEMBRO", "LIDER", "PASTOR", etc. |
| ministerios (array) | ❌ falta | Não existe no schema |
| celulaId (FK para célula) | ⚠️ existe com nome diferente | Campo `groupId` (FK para Group) |
| ebdTurmaId (FK para turma) | ❌ falta | Não existe no schema |
| disponibilidade (dias/turnos para escala) | ❌ falta | Não existe no schema |
| observacoesPastorais | ❌ falta | Não existe no schema |
| tags (array) | ❌ falta | Não existe no schema |
| indicadoPorId (self-reference) | ❌ falta | Não existe no schema |
| deletadoEm (soft delete) | ❌ falta | Não existe no schema — deleção é hard delete |

### 2.3 Campos de identificação pessoal em outros models

| Model | Campo | Tipo |
|-------|-------|------|
| Inscricao | nome | String |
| Inscricao | email | String |
| Inscricao | telefone | String? |
| Checkin | nome | String |
| Checkin | telefone | String? |
| EscalaMembro | — | (usa memberId FK) |
| GroupMember | — | (usa memberId FK) |
| User | name | String |
| User | email | String @unique |

**Observação:** O model `Inscricao` duplica dados de nome/email/telefone que poderiam ser FK para Member (quando o inscrito é membro).

### 2.4 Models com FK para Member

- `GroupMember` → `memberId`
- `GroupFrequencia` → `memberId`
- `CursoProgresso` → `memberId`
- `EscalaMembro` → `memberId`
- `Inscricao` → `memberId` (opcional)
- `Pedido` → `memberId` (opcional)
- `Finance` → `memberId` (opcional)

### 2.5 Models que deveriam ter FK para Member mas não têm

- `Checkin` → armazena `nome` e `telefone` como texto (deveria ter `memberId` opcional + dados do visitante)
- `EventoEquipe` → armazena `responsavelId` (é String, não FK tipada)
- `Aviso` → não tem autor (deveria ter `authorId` FK para User ou Member)

---

## 3. Duplicações de Dados Encontradas

| Módulo | Campo Duplicado | Deveria Ser |
|--------|-----------------|-------------|
| Inscrições (Inscricao) | nome, email, telefone | FK para Member quando o inscrito for membro |
| Check-in (Checkin) | nome, telefone | FK para Member quando for membro; dados de visitante em tabela separada |
| Evento Equipe | responsavelId (String) | FK tipada para Member |
| Financeiro (Finance) | memberId + dados do membro | Apenas memberId (já tem) |
| Lançamentos | descricao com nome do membro | Apenas memberId + template |

---

## 4. Campos Faltando no Member

| Campo | Módulos que Precisam |
|-------|---------------------|
| sexo/gender | Dashboard (filtros), Relatórios |
| estadoCivil | Cadastro de membros, Relatórios |
| endereco (cep, logradouro, bairro, cidade, estado) | Cadastro de membros, Eventos (endereço do evento usa texto livre) |
| dataBatismoAguas | Cadastro de membros, Relatórios |
| dataBatismoEspirito | Cadastro de membros, Relatórios |
| ministerios (array) | Escalas de Ministério, Grupos |
| disponibilidade (dias/turnos) | Escalas de Ministério |
| observacoesPastorais | Cadastro de membros |
| tags (array) | Comunicação, Segmentação |
| deletadoEm (soft delete) | Todos os módulos (evita perda de dados) |

---

## 5. Módulos SEM Busca de Membro Integrada

| Módulo | Implementa Própria Busca? | Como Busca? |
|--------|---------------------------|-------------|
| Dashboard | ❌ Não | Não busca membros diretamente |
| Financeiro | ⚠️ Parcial | Busca por memberId (não por nome) |
| Eventos / Inscrições | ❌ Não | Inscrição pública não vincula a membro existente |
| Escalas | ✅ Sim | Busca por memberId (select) |
| Grupos | ✅ Sim | Busca por memberId (modal) |
| Ensino | ✅ Sim | Busca por memberId (progresso) |
| Comunicação | ❌ Não | Não implementa busca de destinatários |
| Loja | ❌ Não | Pedidos usam memberId opcional |

**Não existe componente compartilhado de busca/seleção de membro.** Cada módulo implementa sua própria busca quando necessário.

---

## 6. Riscos de Segurança Multi-tenant

### 6.1 APIs SEM filtro de tenantId — CRÍTICO

| Arquivo | Problema | Risco |
|---------|----------|-------|
| `app/api/eventos/route.ts` POST | `const tenant = await prisma.tenant.findFirst()` — pega o PRIMEIRO tenant do banco | Qualquer evento criado vai para o tenant errado |
| `app/api/eventos/route.ts` POST | `prisma.event.findFirst({ where: { slug } })` — sem tenantId | Slug duplicado entre tenants pode falhar |
| `app/api/inscricoes/route.ts` GET | `where = eventId ? { eventId } : {}` — sem tenantId | Lista TODAS as inscrições de TODOS os tenants |
| `app/api/inscricoes/route.ts` POST | Busca evento por `id` mas não verifica se pertence ao tenant | Inscrição em evento de outro tenant |
| `app/api/eventos/[id]/avancado/route.ts` GET/POST | Todas as queries usam apenas `eventId` — sem verificar tenant | Qualquer um pode manipular dados de eventos de outros tenants |
| `app/api/loja/[slug]/route.ts` | Busca tenant por slug — OK para loja pública | — |
| `app/api/produtos/route.ts` | `prisma.tenant.findFirst()` — pega primeiro tenant | Produtos vão para tenant errado |
| `app/api/ensino/route.ts` | `prisma.tenant.findFirst()` — pega primeiro tenant | Cursos vão para tenant errado |
| `app/api/midias/route.ts` | `prisma.tenant.findFirst()` — pega primeiro tenant | Mídias vão para tenant errado |
| `app/api/backup/route.ts` | Filtra por tenantId — ✅ OK | — |

### 6.2 APIs COM filtro de tenantId — OK

- `app/api/members/route.ts` ✅
- `app/api/grupos/route.ts` ✅
- `app/api/financeiro/route.ts` ✅
- `app/api/cultos/route.ts` ✅
- `app/api/escalas/route.ts` ✅
- `app/api/patrimonio/route.ts` ✅
- `app/api/dashboard/stats/route.ts` ✅
- `app/api/tenant/route.ts` ✅

---

## 7. Diagnóstico de Escalabilidade

### 7.1 Connection Pooling

**Status: ❌ CRÍTICO**

Configuração atual no `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Problemas:**
- Não existe `directUrl` separada da `url`
- Em ambiente serverless (Vercel), cada função cria novas conexões
- Sem connection pooling (porta 6543 do Supabase), o banco pode esgotar conexões com múltiplos usuários simultâneos
- O Prisma Client é instanciado via `@firmes/db` — precisa verificar se é singleton

**Ação necessária:**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // pooler: porta 6543
  directUrl = env("DIRECT_URL")        // direta: porta 5432
}
```

### 7.2 Índices — Resultado

| Índice | Existe? | Impacto |
|--------|---------|---------|
| Member: tenantId | ❌ Não | Full scan em todas as queries de membros |
| Member: (tenantId, status) | ❌ Não | Filtro de status lento |
| Member: (tenantId, groupId) | ❌ Não | Filtro de grupo lento |
| Member: name | ❌ Não | Busca textual lenta |
| Member: email | ❌ Não | Busca por email lenta |
| Member: birthDate | ❌ Não | Aniversariantes lento |
| Group: tenantId | ❌ Não | Full scan |
| Event: tenantId | ❌ Não | Full scan |
| Event: date | ❌ Não | Filtro por data lento |
| Finance: tenantId | ❌ Não | Full scan |
| Culto: tenantId | ❌ Não | Full scan |
| Checkin: cultoId | ❌ Não | Lista de check-ins lenta |
| Inscricao: eventId | ❌ Não | Lista de inscrições lenta |
| Tenant: slug | ✅ Sim | `@unique` |
| Tenant: email | ✅ Sim | `@unique` |
| User: email | ✅ Sim | `@unique` |
| GroupMember: (groupId, memberId) | ✅ Sim | `@@unique` |
| GroupFrequencia: (groupId, date) | ✅ Sim | `@@index` |
| CursoProgresso: (cursoId, aulaId, memberId) | ✅ Sim | `@@unique` |
| Event: slug | ✅ Sim | `@unique` |
| Inscricao: qrCode | ✅ Sim | `@unique` |
| Produto: (tenantId, nome) | ✅ Sim | `@@unique` |
| Patrimonio: (tenantId, nome) | ✅ Sim | `@@unique` |

**Índices críticos faltando:**
1. `@@index([tenantId])` em Member, Group, Event, Finance, Culto, Checkin, Inscricao, Escala, Curso
2. `@@index([tenantId, status])` em Member
3. `@@index([tenantId, groupId])` em Member
4. `@@index([name])` em Member (para busca)
5. `@@index([eventId])` em Inscricao
6. `@@index([cultoId])` em Checkin

### 7.3 Queries sem churchId/tenantId (risco de vazamento)

| Arquivo | Linha | Query | Severidade |
|---------|-------|-------|------------|
| `app/api/eventos/route.ts` | 51 | `prisma.tenant.findFirst()` | 🔴 CRÍTICO |
| `app/api/eventos/route.ts` | 63 | `prisma.event.findFirst({ where: { slug } })` | 🔴 CRÍTICO |
| `app/api/inscricoes/route.ts` | 9-11 | `prisma.inscricao.findMany({ where: {} })` | 🔴 CRÍTICO |
| `app/api/inscricoes/route.ts` | 31 | `prisma.event.findUnique({ where: { id: eventId } })` | 🔴 CRÍTICO |
| `app/api/eventos/[id]/avancado/route.ts` | 8-15 | Todas as findMany por eventId apenas | 🔴 CRÍTICO |
| `app/api/produtos/route.ts` | 7 | `prisma.tenant.findFirst()` | 🔴 CRÍTICO |
| `app/api/ensino/route.ts` | 7 | `prisma.tenant.findFirst()` | 🔴 CRÍTICO |
| `app/api/midias/route.ts` | 7 | `prisma.tenant.findFirst()` | 🔴 CRÍTICO |
| `app/api/loja/[slug]/route.ts` | 18 | Busca por slug (público, OK) | 🟡 Baixo |

### 7.4 Queries sem paginação

| Endpoint | Problema |
|----------|----------|
| `GET /api/members` | ✅ Tem paginação (skip/take) |
| `GET /api/financeiro` | ✅ Tem paginação |
| `GET /api/eventos` | ❌ Sem paginação — retorna TODOS |
| `GET /api/grupos` | ❌ Sem paginação |
| `GET /api/cultos` | ❌ Sem paginação |
| `GET /api/escalas` | ❌ Sem paginação |
| `GET /api/inscricoes` | ❌ Sem paginação + sem tenantId |
| `GET /api/produtos` | ❌ Sem paginação |
| `GET /api/ensino` | ❌ Sem paginação |
| `GET /api/midias` | ❌ Sem paginação |
| `GET /api/patrimonio` | ❌ Sem paginação |
| `GET /api/notificacoes` | ❌ Sem paginação |
| `GET /api/users` | ❌ Sem paginação |
| `GET /api/dashboard/activity` | ⚠️ Limitado a 5 itens (take: 5) |

### 7.5 RLS no Supabase

**Status: ❌ AUSENTE**

Não foram encontradas RLS policies em nenhum arquivo de migration SQL. As migrations existentes (`20260510000000_add_missing_tables`, `20260514000000_add_onboarding_terms`) contêm apenas CREATE TABLE e CREATE INDEX.

Não existe nenhuma policy do tipo:
```sql
CREATE POLICY "tenant_isolation" ON "Member"
  USING ("tenantId" = auth.jwt()->>'tenantId');
```

**Risco:** Sem RLS, mesmo que as APIs sejam corrigidas, acesso direto ao banco (ex: via SQL Editor do Supabase) não tem barreira de isolamento.

### 7.6 Performance do Dashboard

| Aspecto | Status |
|---------|--------|
| Queries paralelas com Promise.all? | ✅ Sim — `app/api/dashboard/stats/route.ts` usa Promise.all para count/aggregate |
| Cache implementado? | ❌ Não — nenhum revalidate, SWR ou React Query |
| Número de queries para montar dashboard | 5 queries (members, groups, events, finances, recentMembers) |
| Dados de crescimento | ❌ Fallback estático (GROWTH_FALLBACK) — não busca do banco |
| Dados de atividade | ✅ Busca do banco (recentMembers, recentFinances, recentEvents) |

### 7.7 Limites de Infraestrutura Detectados

| Aspecto | Status |
|---------|--------|
| **Vercel** | Plano inferido: Hobby (sem `maxDuration` no vercel.json) |
| **Timeout de funções** | 10s (padrão Hobby) — suficiente para maioria, mas relatórios pesados podem estourar |
| **Supabase** | Plano não identificado (URL não visível em arquivos versionados) |
| **Connection pooling** | ❌ Não configurado (sem directUrl) |
| **Upload de arquivos** | ⚠️ Parcial — fotos de membros via URL externa (campo `photo` é String URL), não há Supabase Storage configurado |
| **Cron jobs** | ✅ Configurado no vercel.json (`/api/cron/relatorio-anual`) |

### 7.8 Controle de Roles e Permissões

| Aspecto | Status |
|---------|--------|
| Multi-admin por igreja | ✅ Sim — model User tem `tenantId` |
| Roles implementados | ⚠️ Parcial — `role` no User (ADMIN, SECRETARIO, MEMBRO, LIDER_CELULA, TESOUREIRO) e `role` no Member (MEMBRO, LIDER, PASTOR, DIACONO, PRESBITERO, EVANGELISTA, MISSIONARIO, OBREIRO, MEMBRO_HONORARIO, CONGREGADO, VISITANTE) |
| Rate limiting nas APIs | ❌ Não implementado |
| Controle de limites por plano | ⚠️ Parcial — `plan` e `maxChurches` no Tenant, mas sem validação ativa no código |
| Middleware de role | ❌ Não existe — qualquer usuário autenticado acessa qualquer rota |

---

## 8. Placar Geral de Prontidão para Escala

| Aspecto | Status | Prioridade |
|---------|--------|------------|
| Connection pooling | ❌ Crítico | A |
| Índices críticos no banco | ❌ Crítico | A |
| tenantId em todas as queries | ❌ Crítico | A |
| RLS no Supabase | ❌ Crítico | A |
| Paginação nas listagens | ⚠️ Risco | A |
| Cache no dashboard | ⚠️ Risco | M |
| Roles e permissões | ⚠️ Risco | M |
| Soft delete implementado | ❌ Crítico | M |

Legenda: A = Alta · M = Média · B = Baixa

---

## 9. Prioridade de Correções

### CRÍTICO — corrigir antes de qualquer novo cliente pago:

1. **Adicionar `tenantId` em TODAS as queries de API** — especialmente `eventos`, `inscricoes`, `produtos`, `ensino`, `midias`
2. **Configurar connection pooling no Prisma** — adicionar `directUrl` ao schema.prisma
3. **Adicionar índices em `tenantId`** em todas as tabelas principais (Member, Group, Event, Finance, Culto, Checkin, Inscricao)
4. **Implementar RLS policies no Supabase** — pelo menos para Member, Event, Finance, Group
5. **Corrigir POST /api/eventos** — usar `session.tenantId` em vez de `prisma.tenant.findFirst()`

### Alta — corrigir no próximo sprint:

6. **Adicionar paginação** em todas as listagens (eventos, grupos, cultos, escalas, produtos, etc.)
7. **Implementar soft delete** (`deletedAt`) no Member e outros models críticos
8. **Adicionar campos faltantes no Member** — sexo, estadoCivil, endereço, dataBatismoAguas, dataBatismoEspirito
9. **Implementar cache no dashboard** — Next.js `revalidate` ou SWR
10. **Criar componente compartilhado de busca de membro** — `MemberSearch`/`MemberPicker`

### Média — planejar para as próximas semanas:

11. **Implementar rate limiting** nas APIs (ex: Upstash Ratelimit)
12. **Validar limites por plano** — max membros, max usuários admin
13. **Adicionar middleware de roles** — restringir rotas por role (ADMIN, SECRETARIO, etc.)
14. **Configurar Supabase Storage** para upload de fotos e arquivos
15. **Adicionar logs de auditoria** — quem alterou o quê e quando

### Baixa — melhorias futuras:

16. **Otimizar queries do dashboard** — usar aggregates em vez de carregar dados em memória
17. **Implementar busca full-text** no Member (PostgreSQL tsvector)
18. **Adicionar cache de query no Prisma** — para dados que mudam pouco
19. **Implementar WebSockets** para check-in em tempo real
20. **Criar testes de integração** para APIs críticas

---

## 10. O que está bem implementado (não mexer na Fase B)

| Aspecto | Onde | Por que está bom |
|---------|------|------------------|
| **Autenticação com JWT** | `lib/auth.ts` | Sessão segura com cookie httpOnly, tenantId e role no token |
| **Middleware de proteção** | `proxy.ts` | Redireciona não-autenticados para /login, protege rotas /(app) |
| **Super Admin isolado** | `app/(app)/superadmin/`, `app/api/superadmin/` | Sessão separada (`superadmin_session`), não interfere no tenant |
| **Paginação de membros** | `app/api/members/route.ts` | Usa skip/take corretamente |
| **Promise.all no dashboard** | `app/api/dashboard/stats/route.ts` | Queries paralelas para counts |
| **Schema modular** | `schema.prisma` | Models bem organizados com relações claras |
| **Stripe integration** | `app/api/stripe/`, `app/api/webhooks/stripe/` | Webhooks configurados para checkout e subscriptions |
| **Cron job de relatório anual** | `app/api/cron/relatorio-anual/route.ts` | Configurado no vercel.json |
| **QR Code único** | `Event.qrCode` @unique, `Inscricao.qrCode` @unique | Garante unicidade para check-in |
| **Enum de planos** | `enum Plan` | FREE, PRATA, OURO, DIAMANTE, ESMERALDA_* |
| **Multi-tenant no schema** | `tenantId` em quase todos os models | Arquitetura correta para SaaS |
| **Componente MemberForm reutilizável** | `app/components/MemberForm.tsx` | Usado em cadastro e edição |

---

## Anexos

### A. Estrutura de Arquivos do Projeto

```
firmes/
├── apps/
│   ├── landing/                    # App principal (Next.js)
│   │   ├── app/
│   │   │   ├── (app)/              # Rotas protegidas (com sidebar)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── pessoas/
│   │   │   │   ├── grupos/
│   │   │   │   ├── financeiro/
│   │   │   │   ├── eventos/
│   │   │   │   ├── cultos/
│   │   │   │   ├── escalas/
│   │   │   │   ├── ensino/
│   │   │   │   ├── midias/
│   │   │   │   ├── patrimonio/
│   │   │   │   ├── vendas/
│   │   │   │   ├── comunicacao/
│   │   │   │   ├── configuracoes/
│   │   │   │   ├── avisos/
│   │   │   │   ├── white-label/
│   │   │   │   └── superadmin/
│   │   │   ├── api/                # Rotas de API
│   │   │   ├── cadastro/[slug]/    # Cadastro público
│   │   │   ├── checkin/[qrCode]/   # Check-in público
│   │   │   ├── inscricao/[slug]/   # Inscrição pública
│   │   │   ├── loja/[slug]/        # Loja pública
│   │   │   └── login/              # Login
│   │   ├── components/             # Componentes compartilhados
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MemberForm.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── auth.ts             # Autenticação
│   │   │   └── plans.ts            # Config de planos
│   │   └── proxy.ts                # Middleware
│   └── landing/                    # Landing page
├── packages/
│   └── db/
│       └── prisma/
│           ├── schema.prisma         # Schema do banco
│           └── migrations/           # Migrations
├── reports/
│   └── fase-a-auditoria.md         # Este relatório
└── vercel.json                     # Config do Vercel
```

### B. Models do Schema Prisma (resumo)

| Model | Propósito | tenantId? |
|-------|-----------|-----------|
| Tenant | Igreja/tenant | — (raiz) |
| User | Usuário do painel | ✅ |
| Member | Membro da igreja | ✅ |
| Group | Célula/grupo | ✅ |
| GroupMember | Membro em grupo | — (via FKs) |
| GroupFrequencia | Frequência em grupo | — (via FKs) |
| Event | Evento da igreja | ✅ |
| Inscricao | Inscrição em evento | ✅ |
| Finance | Lançamento financeiro | ✅ |
| ContaBancaria | Conta bancária | ✅ |
| Meta | Meta financeira | ✅ |
| Culto | Culto para check-in | ✅ |
| Checkin | Check-in em culto | ✅ |
| Escala | Escala de ministério | ✅ |
| EscalaMembro | Membro em escala | — (via FKs) |
| Produto | Produto da loja | ✅ |
| ProdutoVariacao | Variação de produto | — (via produtoId) |
| Cupom | Cupom de desconto | ✅ |
| Pedido | Pedido da loja | ✅ |
| Curso | Curso de ensino | ✅ |
| CursoModulo | Módulo do curso | — (via cursoId) |
| CursoAula | Aula do curso | — (via moduloId) |
| CursoProgresso | Progresso do aluno | — (via FKs) |
| CursoCategoria | Categoria de curso | ✅ |
| Patrimonio | Bem patrimonial | ✅ |
| Midia | Mídia (foto/vídeo) | ✅ |
| Notificacao | Notificação | ✅ |
| Aviso | Aviso da igreja | ✅ |
| AuditLog | Log de auditoria | — (global) |

---

*Relatório gerado automaticamente pela auditoria de dependências e escalabilidade do FIRMES.*
