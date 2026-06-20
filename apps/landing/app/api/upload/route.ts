import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "../../../lib/auth";

const supabaseUrl = "https://jygyljomepybajqqwbpw.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!supabaseKey) {
      return NextResponse.json({ error: "Storage nao configurado (chave ausente)" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Criar bucket se não existir
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === "firmes-uploads");
      if (!bucketExists) {
        await supabase.storage.createBucket("firmes-uploads", {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
      }
    } catch (bucketErr) {
      console.error("[POST /api/upload] Bucket creation error:", bucketErr);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "banners";

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande (máx 5MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "png";
    const path = `${folder}/${session.tenantId}/${Date.now()}.${ext}`;

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

    const { data: publicUrl } = supabase.storage
      .from("firmes-uploads")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl.publicUrl, path: data.path });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
