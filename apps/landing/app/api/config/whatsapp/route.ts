import { NextRequest, NextResponse } from "next/server";

// TODO: Substituir por configuração real do banco quando implementar tabela de configurações
const WHATSAPP_NUMBER = process.env.WHATSAPP_SUPPORT_NUMBER || "5511999999999";

export async function GET() {
  return NextResponse.json({ number: WHATSAPP_NUMBER });
}
