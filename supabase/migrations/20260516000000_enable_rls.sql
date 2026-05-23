-- ============================================================
-- FIRMES — Row Level Security (RLS)
-- Gerado pela Fase B-Zero
-- Isola dados entre tenants no nível do banco de dados
-- ============================================================

-- PASSO 1: Habilitar RLS em todas as tabelas principais
ALTER TABLE "Member"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Finance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Culto"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Produto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Escala"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Inscricao" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Checkin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patrimonio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Midia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Curso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cupom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pedido" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContaBancaria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Meta" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notificacao" ENABLE ROW LEVEL SECURITY;

-- PASSO 2: Policies para o service_role (usado pelo Prisma/backend)
CREATE POLICY "service_role_all_member"
  ON "Member" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_event"
  ON "Event" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_finance"
  ON "Finance" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_culto"
  ON "Culto" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_group"
  ON "Group" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_produto"
  ON "Produto" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_escala"
  ON "Escala" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_inscricao"
  ON "Inscricao" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_checkin"
  ON "Checkin" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_patrimonio"
  ON "Patrimonio" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_midia"
  ON "Midia" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_curso"
  ON "Curso" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_cupom"
  ON "Cupom" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_pedido"
  ON "Pedido" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_contabancaria"
  ON "ContaBancaria" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_meta"
  ON "Meta" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_notificacao"
  ON "Notificacao" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- PASSO 3: Bloquear acesso anônimo e authenticated direto
CREATE POLICY "block_anon_member"
  ON "Member" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_event"
  ON "Event" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_finance"
  ON "Finance" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_culto"
  ON "Culto" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_group"
  ON "Group" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_produto"
  ON "Produto" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_escala"
  ON "Escala" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_inscricao"
  ON "Inscricao" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_checkin"
  ON "Checkin" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_patrimonio"
  ON "Patrimonio" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_midia"
  ON "Midia" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_curso"
  ON "Curso" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_cupom"
  ON "Cupom" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_pedido"
  ON "Pedido" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_contabancaria"
  ON "ContaBancaria" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_meta"
  ON "Meta" FOR ALL
  TO anon, authenticated
  USING (false);

CREATE POLICY "block_anon_notificacao"
  ON "Notificacao" FOR ALL
  TO anon, authenticated
  USING (false);
