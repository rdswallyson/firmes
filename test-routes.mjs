const BASE = "http://localhost:3001";

async function test(name, url, options = {}) {
  try {
    const res = await fetch(url, { redirect: "manual", ...options });
    let body = "";
    try {
      body = await res.text();
      if (body.startsWith("{") || body.startsWith("[")) {
        body = JSON.stringify(JSON.parse(body), null, 2);
      } else if (body.includes("<!DOCTYPE")) {
        body = "[HTML Page]";
      }
    } catch {}
    
    const location = res.headers.get("location");
    console.log(`\n=== ${name} ===`);
    console.log(`Status: ${res.status}`);
    if (location) console.log(`Location: ${location}`);
    if (body && body !== "[HTML Page]") console.log(`Body: ${body}`);
    else if (body) console.log(`Body: ${body}`);
    return res;
  } catch (e) {
    console.log(`\n=== ${name} ===`);
    console.log(`Error: ${e.message}`);
    return null;
  }
}

console.log("========================================");
console.log("        TESTES DE ROTAS API");
console.log("========================================");

await test("1. GET /api/auth/session (sem cookie)", `${BASE}/api/auth/session`);
await test("2. GET /api/dashboard/stats (sem auth)", `${BASE}/api/dashboard/stats`);
await test("3. GET /api/members (sem auth)", `${BASE}/api/members`);
await test("4. GET /login", `${BASE}/login`);

console.log("\n========================================");
console.log("       RESUMO DOS TESTES");
console.log("========================================");
console.log("- /api/auth/session: OK se retorna {user: null}");
console.log("- /api/dashboard/stats: OK se redireciona para /login (302)");
console.log("- /api/members: OK se redireciona para /login (302)");
console.log("- /login: OK se retorna 200 (pagina de login)");
console.log("\n--- Testes concluidos ---");
