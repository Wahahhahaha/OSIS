const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const classes = await prisma.class.findMany({
    include: {
      grade: true,
      major: true,
    }
  });

  const students = await prisma.student.findMany({
    include: {
      class: true,
    }
  });

  const users = await prisma.user.findMany({
    include: {
      level: true,
    }
  });

  console.log('--- CLASSES ---');
  console.log(JSON.stringify(classes, null, 2));

  console.log('--- STUDENTS ---');
  console.log(JSON.stringify(students, null, 2));

  console.log('--- USERS ---');
  console.log(JSON.stringify(users.map(u => ({ id: u.id, username: u.username, level: u.level.levelname })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
