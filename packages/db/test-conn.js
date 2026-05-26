const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ Conexão OK:', result);
    
    const memberCount = await prisma.member.count();
    console.log('✅ Members count:', memberCount);
    
    const eventCount = await prisma.event.count();
    console.log('✅ Events count:', eventCount);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
