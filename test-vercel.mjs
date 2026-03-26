const BASE = process.argv[2] || "https://firmes.vercel.app";

async function main() {
  console.log("Testing:", BASE);

  console.log("\n=== 1. Debug endpoint ===");
  try {
    const d = await fetch(BASE + "/api/debug");
    console.log("Status:", d.status);
    console.log("Body:", await d.text());
  } catch (e) {
    console.log("Error:", e.message);
  }

  console.log("\n=== 2. Login endpoint ===");
  try {
    const r = await fetch(BASE + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@firmes.com", password: "Admin@2026" }),
    });
    console.log("Status:", r.status);
    console.log("Body:", await r.text());
  } catch (e) {
    console.log("Error:", e.message);
  }
}

main();
