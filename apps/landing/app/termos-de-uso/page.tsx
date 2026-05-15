export default function TermosUsoPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB", fontFamily: "var(--font-nunito), sans-serif", padding: "48px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", background: "#fff", borderRadius: 16, padding: "48px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0D2545", marginBottom: 8 }}>Termos de Uso</h1>
        <p style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 32 }}>Última atualização: 15 de maio de 2026</p>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A3C6E", marginBottom: 8 }}>1. Aceitação dos Termos</h2>
          <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}>
            Ao acessar e usar o FIRMES, você concorda com estes termos. Se não concordar, não utilize o sistema.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A3C6E", marginBottom: 8 }}>2. Regras de Uso</h2>
          <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}>
            O usuário se compromete a: usar o sistema para fins legítimos de gestão eclesiástica, não compartilhar credenciais de acesso, não tentar acessar dados de outros tenants, não usar o sistema para atividades ilegais.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A3C6E", marginBottom: 8 }}>3. Planos e Pagamentos</h2>
          <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}>
            O plano Gratuito é oferecido sem custos. Planos pagos são cobrados mensalmente via Stripe. O não pagamento pode resultar na suspensão do acesso.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A3C6E", marginBottom: 8 }}>4. Cancelamento e Reembolso</h2>
          <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}>
            O usuário pode cancelar a qualquer momento. Reembolsos são analisados caso a caso e podem ser concedidos em até 7 dias após a cobrança, mediante solicitação.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A3C6E", marginBottom: 8 }}>5. Limitação de Responsabilidade</h2>
          <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}>
            O FIRMES é fornecido "como está". Não nos responsabilizamos por perdas de dados causadas por negligência do usuário ou por falhas de conectividade. Recomendamos exportar backups periodicamente.
          </p>
        </section>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #E5E7EB", textAlign: "center" }}>
          <a href="/" style={{ color: "#1A3C6E", fontWeight: 600, textDecoration: "none" }}>← Voltar para a página inicial</a>
        </div>
      </div>
    </div>
  );
}
