/**
 * Next.js Instrumentation — executa uma vez no startup do servidor.
 * Aplica as migrations pendentes no banco sem bloquear o build.
 * Ref: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { execSync } = await import("child_process");
      const schema = require("path").resolve(
        __dirname,
        "../../packages/db/prisma/schema.prisma"
      );
      execSync(`npx prisma migrate deploy --schema="${schema}"`, {
        timeout: 60_000,
        stdio: "pipe",
      });
      console.log("[FIRMES] Migrations aplicadas com sucesso.");
    } catch (e: unknown) {
      // Não quebrar o servidor se a migration falhar — logar e continuar
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("[FIRMES] Migration skipped:", msg.split("\n")[0]);
    }
  }
}
