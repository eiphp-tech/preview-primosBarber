import { PrismaClient } from '@prisma/client';

// Criar instância única do Prisma
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'], // Logs para debug
});

// Testar conexão ao inicializar
prisma.$connect()
  .then(() => {
    console.log('✅ PostgreSQL conectado (localhost:5432)');
    console.log('📊 Banco: vintage_barber');
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar no banco:', error);
    process.exit(1); // Encerra se falhar
  });

// Graceful shutdown (fecha conexão ao encerrar)
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Desconectado do PostgreSQL');
});

export default prisma;