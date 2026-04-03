import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { valor, descricao } = body;

    if (!valor || valor <= 0) {
      return NextResponse.json({ error: "Valor invalido" }, { status: 400 });
    }

    // Simular geracao de PIX - em producao, integrar com provedor real (MercadoPago, Pagar.me, etc)
    const txid = `PIX${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
    
    // QR Code mock - em producao, gerar via biblioteca qrcode ou receber do provedor
    const qrCode = `data:image/svg+xml;base64,${Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="50" height="50" fill="#1A3C6E"/>
        <rect x="140" y="10" width="50" height="50" fill="#1A3C6E"/>
        <rect x="10" y="140" width="50" height="50" fill="#1A3C6E"/>
        <rect x="70" y="70" width="60" height="60" fill="#1A3C6E"/>
        <rect x="25" y="25" width="20" height="20" fill="white"/>
        <rect x="155" y="25" width="20" height="20" fill="white"/>
        <rect x="25" y="155" width="20" height="20" fill="white"/>
        <text x="100" y="195" text-anchor="middle" font-size="10" fill="#1A3C6E">FIRMES - R$ ${valor}</text>
      </svg>
    `).toString("base64")}`;

    const copiaCola = `00020126580014BR.GOV.BCB.PIX0136firmes@igreja.org520400005303986540${valor.toFixed(2).replace(".", "")}5802BR5913FIRMES6008SAOPAULO62070503***6304${txid.slice(-4)}`;

    return NextResponse.json({ qrCode, copiaCola, txid });
  } catch (error) {
    console.error("[POST /api/financeiro/pix/gerar]", error);
    return NextResponse.json({ error: "Erro ao gerar PIX" }, { status: 500 });
  }
}
