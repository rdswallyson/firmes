export default function PoliticaPrivacidadePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB", fontFamily: "var(--font-nunito), sans-serif", padding: "48px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", background: "#fff", borderRadius: 16, padding: "48px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0D2545", marginBottom: 8 }}>Política de Privacidade</h1>
        <p style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 32 }}>Última atualização: 15 de maio de 2026</p>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A3C6E", marginBottom: 8 }}>1. Coleta de Dados</h2>
          <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}>
            Coletamos informações necessárias para o funcionamento do sistema: nome, e-mail, telefone, dados da igreja e informações financeiras. Os dados são coletados com o consentimento explícito do usuário.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A3C6E", marginBottom: 8 }}>2. Uso dos Dados</h2>
          <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}>
            Os dados são utilizados exclusivamente para prestação dos serviços do FIRMES: gestão de membros, controle financeiro, eventos e comunicação interna da igreja. Não vendemos nem compartilhamos dados com terceiros para fins comerciais.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A3C6E", marginBottom: 8 }}>3. Direitos do Usuário (LGPD)</h2>
          <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}>
            Conforme o Art. 18 da LGPD, você tem direito a: confirmar a existência de tratamento, acessar seus dados, corrigir dados incompletos ou desatualizados, anonimizar ou bloquear dados desnecessários, excluir dados tratados com consentimento, portabilidade e informação sobre compartilhamento.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A3C6E", marginBottom: 8 }}>4. Segurança</h2>
          <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}>
            Utilizamos criptografia SSL, hospedagem segura na nuvem (Supabase) e backups diários. O acesso aos dados é restrito e auditado.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A3C6E", marginBottom: 8 }}>5. Contato do Encarregado de Dados</h2>
          <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}>
            Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato: <strong>privacidade@firmes.app</strong>
          </p>
        </section>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #E5E7EB", textAlign: "center" }}>
          <a href="/" style={{ color: "#1A3C6E", fontWeight: 600, textDecoration: "none" }}>← Voltar para a página inicial</a>
        </div>
      </div>
    </div>
  );
}
