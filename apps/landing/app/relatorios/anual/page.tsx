export default function RelatoriosAnuaisPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB", fontFamily: "var(--font-nunito), sans-serif", padding: "48px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0D2545", marginBottom: 8 }}>Relatórios Anuais</h1>
        <p style={{ color: "#6B7280", marginBottom: 32 }}>Baixe os relatórios anuais da sua igreja.</p>

        <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center" }}>
          <p style={{ color: "#6B7280", fontSize: 15 }}>Nenhum relatório anual disponível ainda. Os relatórios são gerados automaticamente no dia 1º de janeiro de cada ano.</p>
        </div>
      </div>
    </div>
  );
}
