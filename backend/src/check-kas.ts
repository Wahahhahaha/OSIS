import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const payments = await prisma.kasPayment.findMany({
    include: {
      class: true,
      period: true
    }
  });
  console.log('Payments:', payments);
  const total = await prisma.kasPayment.aggregate({
    _sum: { amount: true }
  });
  console.log('Total accumulated:', total);
}
main().catch(console.error).finally(() => prisma.$disconnect());
