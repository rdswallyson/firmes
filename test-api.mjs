const BASE = "http://localhost:3001";

async function main() {
  console.log("=== 1. Session (sem cookie) ===");
  const s1 = await fetch(BASE + "/api/auth/session");
  console.log("Status:", s1.status);
  console.log("Body:", await s1.text());

  console.log("\n=== 2. Login ===");
  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@firmes.com", password: "Admin@2026" }),
  });
  console.log("Status:", login.status);
  const body = await login.text();
  console.log("Body:", body.substring(0, 500));
  const cookie = login.headers.get("set-cookie");
  if (cookie) console.log("Cookie:", cookie.substring(0, 120));

  if (login.status === 200 && cookie) {
    const sessionCookie = cookie.split(";")[0];

    console.log("\n=== 3. Session (com cookie) ===");
    const s2 = await fetch(BASE + "/api/auth/session", {
      headers: { Cookie: sessionCookie },
    });
    console.log("Status:", s2.status);
    console.log("Body:", await s2.text());

    console.log("\n=== 4. Dashboard Stats ===");
    const stats = await fetch(BASE + "/api/dashboard/stats", {
      headers: { Cookie: sessionCookie },
    });
    console.log("Status:", stats.status);
    console.log("Body:", await stats.text());

    console.log("\n=== 5. Members ===");
    const members = await fetch(BASE + "/api/members", {
      headers: { Cookie: sessionCookie },
    });
    console.log("Status:", members.status);
    const mBody = await members.text();
    console.log("Body:", mBody.substring(0, 300));
  }
}

main().catch(console.error);
