import {
  PrismaClient,
  Role,
  PaymentMethod,
  TransactionStatus,
  BookingStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // ========================================
  // 1. LIMPAR DADOS EXISTENTES
  // ========================================
  console.log("🗑️  Limpando dados existentes...");
  await prisma.review.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.barberSchedule.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Dados limpos\n");

  // ========================================
  // 2. CRIAR BARBEIRO
  // ========================================
  const passwordHash = await bcrypt.hash("123456", 10);

  const barber = await prisma.user.create({
    data: {
      name: "Ronaldinho",
      email: "pedrohdev01@gmail.com",
      password: passwordHash,
      phone: "(34) 998135703",
      role: Role.BARBEIRO,
      avatar: "https://i.pravatar.cc/150?img=33",
    },
  });
  console.log("✅ Barbeiro criado: Ronaldinho");

  // Horários
  await prisma.barberSchedule.create({
    data: {
      barberId: barber.id,
      mondayStart: "08:00",
      mondayEnd: "20:00",
      tuesdayStart: "08:00",
      tuesdayEnd: "20:00",
      wednesdayStart: "08:00",
      wednesdayEnd: "20:00",
      thursdayStart: "08:00",
      thursdayEnd: "20:00",
      fridayStart: "08:00",
      fridayEnd: "20:00",
      saturdayStart: "08:00",
      saturdayEnd: "14:00",
    },
  });

  // ========================================
  // 3. CRIAR CLIENTE TESTE
  // ========================================
  const client = await prisma.user.create({
    data: {
      name: "Cliente Teste",
      email: "cliente@teste.com",
      password: passwordHash,
      role: Role.CLIENTE,
      avatar: "https://i.pravatar.cc/150?img=12",
    },
  });
  console.log("✅ Cliente criado");

  // ========================================
  // 4. CRIAR SERVIÇOS
  // ========================================
  const serviceCorte = await prisma.service.create({
    data: {
      name: "Corte Degradê",
      price: 40.0,
      duration: 45,
      description: "Na régua",
    },
  });
  const serviceBarba = await prisma.service.create({
    data: {
      name: "Barba Lenhador",
      price: 30.0,
      duration: 30,
      description: "Modelada com toalha quente",
    },
  });
  console.log("✅ Serviços criados");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
