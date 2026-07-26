import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('password123', salt);

  console.log('Seeding levels...');
  const studentLevel = await prisma.level.upsert({
    where: { levelname: 'student' },
    update: {},
    create: { levelname: 'student' },
  });

  const schoolLevel = await prisma.level.upsert({
    where: { levelname: 'school' },
    update: {},
    create: { levelname: 'school' },
  });

  const employerLevel = await prisma.level.upsert({
    where: { levelname: 'employer' },
    update: {},
    create: { levelname: 'employer' },
  });

  console.log('Seeding roles...');
  const roleNames = [
    'superadmin',
    'principal',
    'viceprincipal',
    'student affair',
    'members',
    'treasurer',
    'secretaris',
    'president',
    'vice president',
  ];
  const roles: Record<string, any> = {};
  for (const name of roleNames) {
    roles[name] = await prisma.role.upsert({
      where: { rolename: name },
      update: {},
      create: { rolename: name },
    });
  }

  console.log('Seeding grades...');
  const gradeNames = ['VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const grades: Record<string, any> = {};
  for (const name of gradeNames) {
    grades[name] = await prisma.grade.upsert({
      where: { gradename: name },
      update: {},
      create: { gradename: name },
    });
  }

  console.log('Seeding majors...');
  const majorData = [
    {
      majorname: 'Akuntansi Keuangan dan Lembaga',
      majorcode: 'AKL',
    },
    {
      majorname: 'Bisnis Daring Pemasaran',
      majorcode: 'BDP',
    },
    {
      majorname: 'Rekayasa Perangkat Lunak',
      majorcode: 'RPL',
    },
  ];
  const majors: Record<string, any> = {};
  for (const data of majorData) {
    majors[data.majorcode] = await prisma.major.upsert({
      where: { majorcode: data.majorcode },
      update: { majorname: data.majorname },
      create: data,
    });
  }

  console.log('Seeding classes...');
  const sampleClass = await prisma.class.upsert({
    where: { classname: 'X RPL 1' },
    update: {},
    create: {
      classname: 'X RPL 1',
      gradeid: grades['X'].id,
      majorid: majors['RPL'].id,
    },
  });

  console.log('Seeding users...');
  // 1. Student User
  const studentUser = await prisma.user.upsert({
    where: { username: 'student' },
    update: { password: defaultPassword },
    create: {
      username: 'student',
      password: defaultPassword,
      levelId: studentLevel.id,
    },
  });

  await prisma.student.upsert({
    where: { email: 'student@example.com' },
    update: {
      userid: studentUser.id,
      classid: sampleClass.id,
      roleid: null,
    },
    create: {
      userid: studentUser.id,
      email: 'student@example.com',
      classid: sampleClass.id,
      roleid: null,
    },
  });

  // 2. School User
  const schoolUser = await prisma.user.upsert({
    where: { username: 'school' },
    update: { password: defaultPassword },
    create: {
      username: 'school',
      password: defaultPassword,
      levelId: schoolLevel.id,
    },
  });

  await prisma.school.upsert({
    where: { email: 'school@example.com' },
    update: {
      userid: schoolUser.id,
      roleid: roles['principal'].id,
    },
    create: {
      userid: schoolUser.id,
      email: 'school@example.com',
      roleid: roles['principal'].id,
    },
  });

  // 3. Employer User
  const employerUser = await prisma.user.upsert({
    where: { username: 'employer' },
    update: { password: defaultPassword },
    create: {
      username: 'employer',
      password: defaultPassword,
      levelId: employerLevel.id,
    },
  });

  await prisma.employer.upsert({
    where: { email: 'employer@example.com' },
    update: {
      userid: employerUser.id,
      roleid: roles['members'].id,
    },
    create: {
      userid: employerUser.id,
      email: 'employer@example.com',
      roleid: roles['members'].id,
    },
  });

  // 4. Superadmin User
  const superadminUser = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { password: defaultPassword },
    create: {
      username: 'superadmin',
      password: defaultPassword,
      levelId: schoolLevel.id,
    },
  });

  await prisma.school.upsert({
    where: { email: 'superadmin@example.com' },
    update: {
      userid: superadminUser.id,
      roleid: roles['superadmin'].id,
    },
    create: {
      userid: superadminUser.id,
      email: 'superadmin@example.com',
      roleid: roles['superadmin'].id,
    },
  });

  console.log('Seeding system settings...');
  const existingSystem = await prisma.system.findFirst();
  if (!existingSystem) {
    await prisma.system.create({
      data: {
        systemname: 'E-OSIS SMA Mandiri',
        systemlogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&h=128&fit=crop',
        systemfavicon: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=32&h=32&fit=crop',
        systemaddress: 'Jl. Raya Pendidikan No. 45, Jakarta Selatan',
        systemcontact: '+62 21-5556-7788 | support@smamandiri.sch.id',
      },
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
