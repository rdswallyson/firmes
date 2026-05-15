import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, churchName, name } = body;

    if (!to || !churchName) {
      return NextResponse.json({ error: "Email e nome da igreja são obrigatórios" }, { status: 400 });
    }

    if (!resend) {
      return NextResponse.json({ error: "Serviço de e-mail não configurado" }, { status: 503 });
    }

    const { data, error } = await resend.emails.send({
      from: "FIRMES <onboarding@firmes.app>",
      to,
      subject: `Bem-vindo ao FIRMES, ${churchName}! 🔥`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
          <div style="background: linear-gradient(135deg, #0D2545, #1A3C6E); padding: 40px 24px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">FIRMES</h1>
            <p style="color: #C8922A; margin: 8px 0 0; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase;">Sistema de Gestão para Igrejas</p>
          </div>

          <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <h2 style="color: #0D2545; font-size: 22px; margin: 0 0 16px;">Sua conta foi criada com sucesso! 🎉</h2>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
              Olá, <strong>${name || "Pastor"}</strong>! A igreja <strong>${churchName}</strong> agora faz parte da família FIRMES.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="https://firmes.vercel.app/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1A3C6E, #1E4A84); color: white; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px;">Acessar meu painel →</a>
            </div>

            <h3 style="color: #0D2545; font-size: 16px; margin: 32px 0 16px;">3 dicas para começar:</h3>
            <ol style="color: #4B5563; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0 0 32px;">
              <li><strong>Cadastre seus primeiros membros</strong> — Comece pela liderança e expanda para a congregação.</li>
              <li><strong>Crie seus grupos de células</strong> — Organize por região, idade ou ministério.</li>
              <li><strong>Registre suas finanças</strong> — Acompanhe dízimos, ofertas e despesas.</li>
            </ol>

            <div style="background: #F5F0EB; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0; font-size: 14px; color: #6B7280;">📹 <strong>Tutorial em vídeo:</strong> Assista ao nosso guia de primeiros passos no YouTube.</p>
            </div>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />

            <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px;">Precisa de ajuda? Estamos aqui para você:</p>
            <p style="margin: 0; font-size: 14px;">
              💬 WhatsApp: <a href="https://wa.me/5511999999999" style="color: #1A3C6E;">(11) 99999-9999</a><br/>
              📧 E-mail: <a href="mailto:suporte@firmes.app" style="color: #1A3C6E;">suporte@firmes.app</a>
            </p>

            <p style="color: #9CA3AF; font-size: 12px; margin: 24px 0 0; text-align: center;">
              © 2026 FIRMES. Todos os direitos reservados.<br/>
              "Permanecei firmes na fé"
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend error]", error);
      return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("[POST /api/emails/welcome]", error);
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 });
  }
}
