import { NextRequest, NextResponse } from "next/server";
import { createSuperAdminSession } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const superEmail = process.env.SUPERADMIN_EMAIL;
    const superPassword = process.env.SUPERADMIN_PASSWORD;

    if (!superEmail || !superPassword) {
      return NextResponse.json({ error: "Super Admin não configurado" }, { status: 500 });
    }

    if (email !== superEmail || password !== superPassword) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const token = await createSuperAdminSession(email);

    const response = NextResponse.json({ success: true });
    response.cookies.set("superadmin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 dia
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/superadmin/login]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
