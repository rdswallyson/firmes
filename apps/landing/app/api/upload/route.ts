import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { getSession } from "../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "banners";

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    // Validar tipo e tamanho
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande (máx 5MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "png";
    const path = `${folder}/${session.tenantId}/${Date.now()}.${ext}`;

    if (!supabase) {
      return NextResponse.json({ error: "Storage nao configurado" }, { status: 500 });
    }

    const { data, error } = await supabase.storage
      .from("firmes-uploads")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("[POST /api/upload] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Storage nao configurado" }, { status: 500 });
    }

    const { data: publicUrl } = supabase.storage
      .from("firmes-uploads")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl.publicUrl, path: data.path });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
