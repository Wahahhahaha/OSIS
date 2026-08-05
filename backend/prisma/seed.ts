import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);

  // Helper to hash password matching the username
  const hashPassword = async (username: string) => {
    return bcrypt.hash(username, salt);
  };

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
    'Superadmin',
    'Admin',
    'President',
    'Vice President',
    'Secretary',
    'Treasurer',
    'Member',
    'Principal',
    'Vice Principal',
    'Student Affair',
    'Teacher',
    'Student'
  ];
  const roles: Record<string, any> = {};
  for (const name of roleNames) {
    roles[name.toLowerCase()] = await prisma.role.upsert({
      where: { rolename: name },
      update: {},
      create: { rolename: name },
    });
  }

  console.log('Seeding sections...');
  const sectionNames = [
    'sekbid mading',
    'keagamaan islam',
    'kristen',
    'keagamaan buddha',
  ];
  const sections: Record<string, any> = {};
  for (const name of sectionNames) {
    sections[name] = await prisma.section.upsert({
      where: { sectionname: name },
      update: {},
      create: { sectionname: name },
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
    {
      majorname: 'Sekolah Menengah Pertama',
      majorcode: 'SMP',
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
  const classDefinitions = [
    { classname: 'A', gradeName: 'VII', majorCode: 'SMP' },
    { classname: 'A', gradeName: 'VIII', majorCode: 'SMP' },
    { classname: 'A', gradeName: 'IX', majorCode: 'SMP' },
    { classname: 'A', gradeName: 'X', majorCode: 'AKL' },
    { classname: 'A', gradeName: 'X', majorCode: 'BDP' },
    { classname: 'A', gradeName: 'X', majorCode: 'RPL' },
    { classname: 'A', gradeName: 'XI', majorCode: 'AKL' },
    { classname: 'A', gradeName: 'XI', majorCode: 'BDP' },
    { classname: 'A', gradeName: 'XI', majorCode: 'RPL' },
    { classname: 'A', gradeName: 'XII', majorCode: 'AKL' },
    { classname: 'A', gradeName: 'XII', majorCode: 'BDP' },
    { classname: 'A', gradeName: 'XII', majorCode: 'RPL' },
  ];

  const seededClasses: any[] = [];
  for (const def of classDefinitions) {
    const cls = await prisma.class.upsert({
      where: {
        classname_gradeid_majorid: {
          classname: def.classname,
          gradeid: grades[def.gradeName].id,
          majorid: majors[def.majorCode].id,
        }
      },
      update: {},
      create: {
        classname: def.classname,
        gradeid: grades[def.gradeName].id,
        majorid: majors[def.majorCode].id,
      },
    });
    seededClasses.push(cls);
  }

  console.log('Seeding periods and default prokers...');
  const periodData = [
    { yearLabel: '2024/2025', status: 'INACTIVE' },
    { yearLabel: '2025/2026', status: 'INACTIVE' },
    { yearLabel: '2026/2027', status: 'ACTIVE' },
  ];
  const seededPeriods: Record<string, any> = {};
  for (const p of periodData) {
    const today = new Date();
    const voteStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const voteEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

    const period = await prisma.period.upsert({
      where: { yearLabel: p.yearLabel },
      update: { status: p.status },
      create: {
        yearLabel: p.yearLabel,
        status: p.status,
        voteStartDate: voteStart.toISOString(),
        voteEndDate: voteEnd.toISOString(),
      },
    });
    seededPeriods[p.yearLabel] = period;

    const startYear = p.yearLabel.split('/')[0];
    const endYear = p.yearLabel.split('/')[1] || String(Number(startYear) + 1);

    const defaultProkers = [
      {
        name: 'MPLS (Masa Pengenalan Lingkungan Sekolah)',
        description: 'Kegiatan pengenalan lingkungan sekolah bagi siswa baru kelas VII / X.',
        targetDate: `Juli ${startYear}`,
      },
      {
        name: 'Peringatan HUT RI',
        description: 'Penyelenggaraan berbagai perlombaan dan upacara bendera dalam rangka memperingati Hari Kemerdekaan Republik Indonesia.',
        targetDate: `Agustus ${startYear}`,
      },
      {
        name: 'Hari Guru Nasional',
        description: 'Peringatan Hari Guru Nasional sebagai bentuk apresiasi terhadap jasa para guru.',
        targetDate: `November ${startYear}`,
      },
      {
        name: 'Classmeet Akhir Tahun (Semester Ganjil)',
        description: 'Kegiatan perlombaan antar kelas setelah ujian semester ganjil selesai.',
        targetDate: `Desember ${startYear}`,
      },
      {
        name: 'Classmeet Kenaikan Kelas (Semester Genap)',
        description: 'Kegiatan perlombaan antar kelas di pertengahan Juni sebelum pembagian rapor kenaikan kelas.',
        targetDate: `Juni ${endYear}`,
      },
    ];

    for (const dp of defaultProkers) {
      const existingProker = await prisma.proker.findFirst({
        where: {
          periodId: period.id,
          name: dp.name,
        },
      });

      if (!existingProker) {
        await prisma.proker.create({
          data: {
            name: dp.name,
            description: dp.description,
            targetDate: dp.targetDate,
            status: 'Rencana',
            periodId: period.id,
          },
        });
      }
    }
  }

  console.log('Seeding users (other users remain at 1, student has 20)...');

  // 1. superadmin user (1 user, password same as username)
  const superadminUser = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { password: await hashPassword('superadmin') },
    create: {
      username: 'superadmin',
      password: await hashPassword('superadmin'),
      levelId: schoolLevel.id,
    },
  });
  await prisma.school.upsert({
    where: { email: 'superadmin@example.com' },
    update: { userid: superadminUser.id, roleid: roles['superadmin'].id },
    create: {
      userid: superadminUser.id,
      email: 'superadmin@example.com',
      roleid: roles['superadmin'].id,
    },
  });

  // Helper to seed a single school user
  const seedSingleSchoolUser = async (username: string, email: string, roleId: string) => {
    const user = await prisma.user.upsert({
      where: { username },
      update: { password: await hashPassword(username) },
      create: {
        username,
        password: await hashPassword(username),
        levelId: schoolLevel.id,
      },
    });
    await prisma.school.upsert({
      where: { email },
      update: { userid: user.id, roleid: roleId },
      create: {
        userid: user.id,
        email,
        roleid: roleId,
      },
    });
    return user;
  };

  // Seed remaining school users (1 for each role, password = username)
  await seedSingleSchoolUser('teacher', 'teacher@example.com', roles['teacher'].id);
  await seedSingleSchoolUser('admin', 'admin@example.com', roles['admin'].id);
  await seedSingleSchoolUser('principal', 'principal@example.com', roles['principal'].id);
  await seedSingleSchoolUser('viceprincipal', 'viceprincipal@example.com', roles['vice principal'].id);
  await seedSingleSchoolUser('studentaffair', 'studentaffair@example.com', roles['student affair'].id);
  await seedSingleSchoolUser('school', 'school@example.com', roles['principal'].id);

  // Seed default employer user (1 user, password = username)
  const employerUser = await prisma.user.upsert({
    where: { username: 'employer' },
    update: { password: await hashPassword('employer') },
    create: {
      username: 'employer',
      password: await hashPassword('employer'),
      levelId: employerLevel.id,
    },
  });
  await prisma.employer.upsert({
    where: { email: 'employer@example.com' },
    update: { userid: employerUser.id, roleid: roles['member'].id },
    create: {
      userid: employerUser.id,
      email: 'employer@example.com',
      roleid: roles['member'].id,
    },
  });

  // Seed 20 student users (username: student_1 to student_20, password same as username)
  const studentUsers: any[] = [];
  for (let i = 1; i <= 20; i++) {
    const username = `student_${i}`;
    const email = `student${i}@example.com`;

    const user = await prisma.user.upsert({
      where: { username },
      update: { password: await hashPassword(username) },
      create: {
        username,
        password: await hashPassword(username),
        levelId: studentLevel.id,
      },
    });

    // Round-robin distribution of classes
    const targetClass = seededClasses[(i - 1) % seededClasses.length];
    await prisma.student.upsert({
      where: { email },
      update: { userid: user.id, classid: targetClass.id },
      create: {
        userid: user.id,
        email,
        classid: targetClass.id,
      },
    });
    studentUsers.push(user);
  }

  // Seed standard student username just in case it maps to legacy pages
  const defaultStudentUser = await prisma.user.upsert({
    where: { username: 'student' },
    update: { password: await hashPassword('student') },
    create: {
      username: 'student',
      password: await hashPassword('student'),
      levelId: studentLevel.id,
    },
  });
  await prisma.student.upsert({
    where: { email: 'student@example.com' },
    update: { userid: defaultStudentUser.id, classid: seededClasses[0].id },
    create: {
      userid: defaultStudentUser.id,
      email: 'student@example.com',
      classid: seededClasses[0].id,
    },
  });

  console.log('Seeding candidate OSIS (2 candidates in active period)...');
  const activePeriod = seededPeriods['2026/2027'];

  // Candidate 1: PASLON 01
  // President: student_1, Vice President: student_2
  const pres1 = studentUsers[0];
  const vice1 = studentUsers[1];
  const presStudent1 = await prisma.student.findFirst({ where: { userid: pres1.id }, include: { class: true } });
  const viceStudent1 = await prisma.student.findFirst({ where: { userid: vice1.id }, include: { class: true } });
  const presClass1 = presStudent1?.class?.classname || 'A';
  const viceClass1 = viceStudent1?.class?.classname || 'A';

  await prisma.candidate.upsert({
    where: { id: 'cand_1' },
    update: {
      paslonNo: '01',
      name: 'PASLON 01',
      presidentId: pres1.id,
      vicePresidentId: vice1.id,
      presidentName: pres1.username,
      vicePresidentName: vice1.username,
      presidentClass: presClass1,
      vicePresidentClass: viceClass1,
      classes: `${presClass1} & ${viceClass1}`,
      visi: 'Membangun OSIS yang inovatif, transparan, dan inklusif untuk seluruh siswa.',
      misi: 'Mengoptimalkan potensi akademik/non-akademik, menyelenggarakan kegiatan kreatif, dan menampung aspirasi siswa secara terbuka.',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop',
      periodId: activePeriod.id,
    },
    create: {
      id: 'cand_1',
      paslonNo: '01',
      name: 'PASLON 01',
      presidentId: pres1.id,
      vicePresidentId: vice1.id,
      presidentName: pres1.username,
      vicePresidentName: vice1.username,
      presidentClass: presClass1,
      vicePresidentClass: viceClass1,
      classes: `${presClass1} & ${viceClass1}`,
      visi: 'Membangun OSIS yang inovatif, transparan, dan inklusif untuk seluruh siswa.',
      misi: 'Mengoptimalkan potensi akademik/non-akademik, menyelenggarakan kegiatan kreatif, dan menampung aspirasi siswa secara terbuka.',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop',
      periodId: activePeriod.id,
    },
  });

  // Candidate 2: PASLON 02
  // President: student_3, Vice President: student_4
  const pres2 = studentUsers[2];
  const vice2 = studentUsers[3];
  const presStudent2 = await prisma.student.findFirst({ where: { userid: pres2.id }, include: { class: true } });
  const viceStudent2 = await prisma.student.findFirst({ where: { userid: vice2.id }, include: { class: true } });
  const presClass2 = presStudent2?.class?.classname || 'A';
  const viceClass2 = viceStudent2?.class?.classname || 'A';

  await prisma.candidate.upsert({
    where: { id: 'cand_2' },
    update: {
      paslonNo: '02',
      name: 'PASLON 02',
      presidentId: pres2.id,
      vicePresidentId: vice2.id,
      presidentName: pres2.username,
      vicePresidentName: vice2.username,
      presidentClass: presClass2,
      vicePresidentClass: viceClass2,
      classes: `${presClass2} & ${viceClass2}`,
      visi: 'Mewujudkan lingkungan sekolah yang kolaboratif, peduli lingkungan, dan berkarakter mulia.',
      misi: 'Meningkatkan program bakti sosial, menyelenggarakan perlombaan minat bakat, dan memperkuat kedisiplinan berkarakter.',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
      periodId: activePeriod.id,
    },
    create: {
      id: 'cand_2',
      paslonNo: '02',
      name: 'PASLON 02',
      presidentId: pres2.id,
      vicePresidentId: vice2.id,
      presidentName: pres2.username,
      vicePresidentName: vice2.username,
      presidentClass: presClass2,
      vicePresidentClass: viceClass2,
      classes: `${presClass2} & ${viceClass2}`,
      visi: 'Mewujudkan lingkungan sekolah yang kolaboratif, peduli lingkungan, dan berkarakter mulia.',
      misi: 'Meningkatkan program bakti sosial, menyelenggarakan perlombaan minat bakat, dan memperkuat kedisiplinan berkarakter.',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
      periodId: activePeriod.id,
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
