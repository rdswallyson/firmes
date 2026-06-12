const { PrismaClient } = require("../node_modules/@prisma/client");
const prisma = new PrismaClient();

async function test() {
  try {
    const item = await prisma.patrimonio.create({
      data: {
        tenantId: "cm8ul9p8r0000j3k8j3k8j3k",
        nome: "Teste Mesa Yamaha",
        categoria: "Instrumentos Musicais",
        estado: "NOVO",
        isActive: true,
        qrCode: "test-qr-" + Date.now(),
      },
    });
    console.log("SUCESSO:", JSON.stringify(item, null, 2));
  } catch (e) {
    console.log("ERRO:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
