import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, BadRequestException, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  private getGradeLevelNumber(gradeName: string) {
    const normalized = (gradeName || '').trim().toUpperCase();
    const romanMap: Record<string, number> = {
      VII: 7,
      VIII: 8,
      IX: 9,
      X: 10,
      XI: 11,
      XII: 12,
    };

    if (romanMap[normalized]) {
      return romanMap[normalized];
    }

    const match = normalized.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }

  private isSmpMajor(major: { majorcode: string; majorname: string }) {
    const majorCode = (major.majorcode || '').trim().toLowerCase();
    const majorName = (major.majorname || '').trim().toLowerCase();
    return majorCode === 'smp' || majorName.includes('smp');
  }

  private validateClassMajorCombination(gradeName: string, major: { majorcode: string; majorname: string }) {
    const gradeLevel = this.getGradeLevelNumber(gradeName);
    if (!gradeLevel) {
      throw new BadRequestException('Grade tidak valid');
    }

    const isSmpMajor = this.isSmpMajor(major);
    if (gradeLevel <= 9 && !isSmpMajor) {
      throw new BadRequestException('Grade VII, VIII, dan IX hanya boleh menggunakan major SMP');
    }
    if (gradeLevel >= 10 && isSmpMajor) {
      throw new BadRequestException('Grade X, XI, dan XII tidak boleh menggunakan major SMP');
    }
  }

  private validateOrganizationMemberGrade(gradeName: string) {
    const gradeLevel = this.getGradeLevelNumber(gradeName);
    const allowedGrades = [7, 8, 10, 11];
    if (!gradeLevel || !allowedGrades.includes(gradeLevel)) {
      throw new BadRequestException('Hanya siswa grade VII, VIII, X, dan XI yang bisa dipilih sebagai anggota organisasi');
    }
  }

  private async validateCandidateStudentGradeX(userId: string, fieldName: string) {
    if (!userId || userId === '-') {
      throw new BadRequestException(`${fieldName} wajib dipilih`);
    }

    const student = await this.prisma.student.findFirst({
      where: { userid: userId },
      include: {
        class: {
          include: {
            grade: true,
          },
        },
        organizationMembers: {
          include: {
            role: true,
            period: true,
          },
        },
      },
    });

    if (!student) {
      throw new BadRequestException(`${fieldName} tidak ditemukan`);
    }

    const gradeName = student?.class?.grade?.gradename || '';
    const gradeLevel = this.getGradeLevelNumber(gradeName);

    if (gradeLevel !== 10) {
      throw new BadRequestException(`${fieldName} hanya boleh dari student grade X`);
    }

    const activeMember = student.organizationMembers.find((om) => om.period?.status?.toLowerCase() === 'active')
      || student.organizationMembers[0];
    const currentRole = (activeMember?.role?.rolename || 'student').trim().toLowerCase();
    if (currentRole && currentRole !== 'student' && currentRole !== '-' && currentRole !== 'members' && currentRole !== 'member') {
      throw new BadRequestException(`${fieldName} harus student biasa, bukan yang sedang menjabat`);
    }
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('system')
  async getSystemSettings() {
    const system = await this.prisma.system.findFirst();
    if (!system) {
      return {
        systemname: 'E-OSIS SMA Mandiri',
        systemlogo: null,
        systemfavicon: null,
        systemaddress: null,
        systemcontact: null,
      };
    }
    return system;
  }

  @Post('admin/system')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async updateSystemSettings(@Body() body: any) {
    const existing = await this.prisma.system.findFirst();
    if (existing) {
      return this.prisma.system.update({
        where: { id: existing.id },
        data: {
          systemname: body.systemname,
          systemlogo: body.systemlogo,
          systemfavicon: body.systemfavicon,
          systemaddress: body.systemaddress,
          systemcontact: body.systemcontact,
        },
      });
    } else {
      return this.prisma.system.create({
        data: {
          systemname: body.systemname,
          systemlogo: body.systemlogo,
          systemfavicon: body.systemfavicon,
          systemaddress: body.systemaddress,
          systemcontact: body.systemcontact,
        },
      });
    }
  }

  // Manage Class Endpoints
  @Get('admin/classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair')
  async getClasses() {
    return this.prisma.class.findMany({
      where: { deletedAt: null },
      include: {
        grade: true,
        major: true,
      },
      orderBy: { classname: 'asc' },
    });
  }

  @Post('admin/classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async createClass(@Body() body: any) {
    if (!body.gradeid || !body.majorid || !body.classname) {
      throw new BadRequestException('Data kelas tidak lengkap');
    }

    const grade = await this.prisma.grade.findUnique({ where: { id: body.gradeid } });
    const major = await this.prisma.major.findUnique({ where: { id: body.majorid } });
    if (!grade) {
      throw new BadRequestException('Grade tidak ditemukan');
    }
    if (!major) {
      throw new BadRequestException('Major tidak ditemukan');
    }

    this.validateClassMajorCombination(grade.gradename, major);

    return this.prisma.class.create({
      data: {
        classname: body.classname,
        gradeid: body.gradeid,
        majorid: body.majorid,
      },
    });
  }

  @Delete('admin/classes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async deleteClass(@Param('id') id: string) {
    return this.prisma.class.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Manage Grade Endpoints
  @Get('admin/grades')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair')
  async getGrades() {
    return this.prisma.grade.findMany({
      where: { deletedAt: null },
      orderBy: { gradename: 'asc' },
    });
  }

  @Post('admin/grades')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async createGrade(@Body() body: any) {
    return this.prisma.grade.create({
      data: {
        gradename: body.gradename,
      },
    });
  }

  @Delete('admin/grades/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async deleteGrade(@Param('id') id: string) {
    return this.prisma.grade.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Manage Major Endpoints
  @Get('admin/majors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair')
  async getMajors() {
    return this.prisma.major.findMany({
      where: { deletedAt: null },
      orderBy: { majorcode: 'asc' },
    });
  }

  @Post('admin/majors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async createMajor(@Body() body: any) {
    return this.prisma.major.create({
      data: {
        majorname: body.majorname,
        majorcode: body.majorcode,
      },
    });
  }

  @Delete('admin/majors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async deleteMajor(@Param('id') id: string) {
    return this.prisma.major.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Manage User Endpoints
  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair')
  async getUsers() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        level: true,
        students: {
          include: {
            class: true,
            organizationMembers: {
              include: {
                role: true,
                period: true
              }
            }
          }
        },
        schools: { include: { role: true } },
        employers: { include: { role: true } },
      },
      orderBy: { username: 'asc' },
    });

    // Map email and role to display nicely in the dashboard
    return users.map(u => {
      let email = '-';
      let role = '-';
      let classname = '-';
      let classid = '';
      if (u.level.levelname === 'student' && u.students.length > 0) {
        const s = u.students[0];
        email = s.email;
        const activeMember = s.organizationMembers.find(om => om.period.status.toLowerCase() === 'active')
          || null;
        role = (activeMember?.role?.rolename || 'student').toLowerCase();
        classname = s.class?.classname || '-';
        classid = s.classid || '';
      } else if (u.level.levelname === 'school' && u.schools.length > 0) {
        email = u.schools[0].email;
        role = u.schools[0].role.rolename.toLowerCase();
      } else if (u.level.levelname === 'employer' && u.employers.length > 0) {
        email = u.employers[0].email;
        role = u.employers[0].role.rolename.toLowerCase();
      }
      return {
        id: u.id,
        username: u.username,
        level: u.level.levelname,
        email,
        role,
        classname,
        classid,
      };
    });
  }

  @Post('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async createUser(@Body() body: any) {
    const existing = await this.prisma.user.findUnique({
      where: { username: body.username },
    });
    if (existing) {
      throw new BadRequestException('Username sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const level = await this.prisma.level.findFirst({
      where: { levelname: body.level },
    });
    if (!level) {
      throw new BadRequestException('Level tidak valid');
    }

    const newUser = await this.prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        levelId: level.id,
      },
    });

    if (body.level === 'student') {
      await this.prisma.student.create({
        data: {
          userid: newUser.id,
          email: body.email,
          classid: body.classid || null,
        },
      });
    } else if (body.level === 'school') {
      const role = await this.prisma.role.findFirst({
        where: { rolename: body.role || 'principal' },
      });
      if (!role) {
        throw new BadRequestException('Role untuk level school tidak valid');
      }
      await this.prisma.school.create({
        data: {
          userid: newUser.id,
          email: body.email,
          roleid: role.id,
        },
      });
    } else if (body.level === 'employer') {
      const role = await this.prisma.role.findFirst({
        where: { rolename: body.role || 'members' },
      });
      if (!role) {
        throw new BadRequestException('Role untuk level employer tidak valid');
      }
      await this.prisma.employer.create({
        data: {
          userid: newUser.id,
          email: body.email,
          roleid: role.id,
        },
      });
    }

    return { success: true, message: 'User berhasil dibuat' };
  }

  @Delete('admin/users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async deleteUser(@Param('id') id: string) {
    const deletedTime = new Date();
    await this.prisma.student.updateMany({ where: { userid: id }, data: { deletedAt: deletedTime } });
    await this.prisma.school.updateMany({ where: { userid: id }, data: { deletedAt: deletedTime } });
    await this.prisma.employer.updateMany({ where: { userid: id }, data: { deletedAt: deletedTime } });
    return this.prisma.user.update({ where: { id }, data: { deletedAt: deletedTime } });
  }

  async autoCheckElectedPairs() {
    console.log('[AutoCheck] Running check...');
    const now = new Date();
    
    // Find all periods
    const periods = await this.prisma.period.findMany();

    for (const period of periods) {
      if (!period.voteEndDate) {
        console.log(`[AutoCheck] Period ${period.yearLabel} has no voteEndDate, skipping`);
        continue;
      }
      const endDate = new Date(period.voteEndDate);
      
      // If current time is past the voting end date
      if (now > endDate) {
        // Resolve roles
        let presidentRole = await this.prisma.role.findFirst({
          where: {
            OR: [
              { rolename: { equals: 'president', mode: 'insensitive' } },
              { rolename: { contains: 'president', mode: 'insensitive' } },
              { rolename: { contains: 'ketua', mode: 'insensitive' } }
            ]
          }
        });
        let vicePresidentRole = await this.prisma.role.findFirst({
          where: {
            OR: [
              { rolename: { equals: 'vice president', mode: 'insensitive' } },
              { rolename: { contains: 'vice', mode: 'insensitive' } },
              { rolename: { contains: 'wakil', mode: 'insensitive' } }
            ]
          }
        });

        if (!presidentRole) {
          presidentRole = await this.prisma.role.create({
            data: { rolename: 'president' }
          });
        }
        if (!vicePresidentRole) {
          vicePresidentRole = await this.prisma.role.create({
            data: { rolename: 'vice president' }
          });
        }

        // Deduplicate President and Vice President for this period if multiple exist
        const allPresidents = await this.prisma.organizationMember.findMany({
          where: { periodid: period.id, roleid: presidentRole.id },
          orderBy: { createdAt: 'desc' }
        });
        if (allPresidents.length > 1) {
          const keepId = allPresidents[0].id;
          await this.prisma.organizationMember.deleteMany({
            where: { periodid: period.id, roleid: presidentRole.id, id: { not: keepId } }
          });
        }

        const allVicePresidents = await this.prisma.organizationMember.findMany({
          where: { periodid: period.id, roleid: vicePresidentRole.id },
          orderBy: { createdAt: 'desc' }
        });
        if (allVicePresidents.length > 1) {
          const keepId = allVicePresidents[0].id;
          await this.prisma.organizationMember.deleteMany({
            where: { periodid: period.id, roleid: vicePresidentRole.id, id: { not: keepId } }
          });
        }

        const mappedPresident = await this.prisma.organizationMember.findFirst({
          where: {
            periodid: period.id,
            roleid: presidentRole.id
          }
        });
        const mappedVicePresident = await this.prisma.organizationMember.findFirst({
          where: {
            periodid: period.id,
            roleid: vicePresidentRole.id
          }
        });

        // If they are not mapped yet (or one is missing), we need to perform mapping!
        if (!mappedPresident || !mappedVicePresident) {
          console.log(`[AutoCheck] Period ${period.yearLabel} has ended voting, but President or Vice President is not mapped in OrganizationMember yet. Resolving winner...`);
          
          let winnerCandidateId = period.electedCandidateId;

          // If winner is not set in period, calculate it from votes
          if (!winnerCandidateId) {
            const candidates = await this.prisma.candidate.findMany({
              where: { periodId: period.id }
            });

            if (candidates.length > 0) {
              const candidateVotes = await Promise.all(
                candidates.map(async (c) => {
                  const count = await this.prisma.vote.count({
                    where: { candidateId: c.id }
                  });
                  return { candidate: c, count };
                })
              );

              candidateVotes.sort((a, b) => b.count - a.count);
              winnerCandidateId = candidateVotes[0].candidate.id;

              // Update period elected candidate
              await this.prisma.period.update({
                where: { id: period.id },
                data: { electedCandidateId: winnerCandidateId }
              });
              console.log(`[AutoCheck] Calculated winner for period ${period.yearLabel}: ${winnerCandidateId}`);
            }
          }

          if (winnerCandidateId) {
            // Find the winning candidate
            const winnerCandidate = await this.prisma.candidate.findUnique({
              where: { id: winnerCandidateId }
            });

            if (winnerCandidate) {
              // Ensure President is mapped
              if (winnerCandidate.presidentId && winnerCandidate.presidentId !== '-') {
                const student = await this.prisma.student.findFirst({
                  where: { userid: winnerCandidate.presidentId }
                });
                if (student) {
                  // Delete existing mappings to avoid duplicates
                  await this.prisma.organizationMember.deleteMany({
                    where: { studentid: student.id, periodid: period.id }
                  });
                  await this.prisma.organizationMember.create({
                    data: {
                      studentid: student.id,
                      periodid: period.id,
                      roleid: presidentRole.id
                    }
                  });
                  console.log(`[AutoCheck] Mapped President student ID ${student.id} for period ${period.yearLabel}`);
                }
              }

              // Ensure Vice President is mapped
              if (winnerCandidate.vicePresidentId && winnerCandidate.vicePresidentId !== '-') {
                const student = await this.prisma.student.findFirst({
                  where: { userid: winnerCandidate.vicePresidentId }
                });
                if (student) {
                  // Delete existing mappings to avoid duplicates
                  await this.prisma.organizationMember.deleteMany({
                    where: { studentid: student.id, periodid: period.id }
                  });
                  await this.prisma.organizationMember.create({
                    data: {
                      studentid: student.id,
                      periodid: period.id,
                      roleid: vicePresidentRole.id
                    }
                  });
                  console.log(`[AutoCheck] Mapped Vice President student ID ${student.id} for period ${period.yearLabel}`);
                }
              }
            }
          }
        } else {
          console.log(`[AutoCheck] Period ${period.yearLabel} already has both President and Vice President mapped in OrganizationMember`);
        }
      } else {
        console.log(`[AutoCheck] Period ${period.yearLabel} voting has not ended yet`);
      }
    }
  }

  // Manage Period (Database-backed)
  @Get('admin/periods')
  @UseGuards(JwtAuthGuard)
  async getPeriods() {
    await this.autoCheckElectedPairs();
    const dbPeriods = await this.prisma.period.findMany({
      orderBy: { yearLabel: 'asc' }
    });
    // If database is empty, seed with initial defaults
    if (dbPeriods.length === 0) {
      const seeded = [
        await this.prisma.period.create({ data: { yearLabel: '2024/2025', status: 'ARCHIVED', voteStartDate: '', voteEndDate: '' } }),
        await this.prisma.period.create({ data: { yearLabel: '2025/2026', status: 'INACTIVE', voteStartDate: '', voteEndDate: '' } }),
        await this.prisma.period.create({ data: { yearLabel: '2026/2027', status: 'ACTIVE', voteStartDate: '2026-07-25T08:00', voteEndDate: '2026-07-26T17:00' } }),
      ];
      return seeded;
    }
    return dbPeriods;
  }

  @Post('admin/periods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async createPeriod(@Body() body: any) {
    if (body.status === 'ACTIVE' || body.status === 'active') {
      await this.prisma.period.updateMany({
        where: { status: 'ACTIVE' },
        data: { status: 'INACTIVE' }
      });
    }
    const period = await this.prisma.period.create({
      data: {
        yearLabel: body.yearLabel,
        status: body.status,
        voteStartDate: body.voteStartDate || null,
        voteEndDate: body.voteEndDate || null
      }
    });

    const startYear = body.yearLabel.split('/')[0];
    const endYear = body.yearLabel.split('/')[1] || String(Number(startYear) + 1);

    await this.prisma.proker.createMany({
      data: [
        {
          name: 'MPLS (Masa Pengenalan Lingkungan Sekolah)',
          description: 'Kegiatan pengenalan lingkungan sekolah bagi siswa baru kelas VII / X.',
          targetDate: `Juli ${startYear}`,
          status: 'Rencana',
          periodId: period.id,
        },
        {
          name: 'Peringatan HUT RI',
          description: 'Penyelenggaraan berbagai perlombaan dan upacara bendera dalam rangka memperingati Hari Kemerdekaan Republik Indonesia.',
          targetDate: `Agustus ${startYear}`,
          status: 'Rencana',
          periodId: period.id,
        },
        {
          name: 'Hari Guru Nasional',
          description: 'Peringatan Hari Guru Nasional sebagai bentuk apresiasi terhadap jasa para guru.',
          targetDate: `November ${startYear}`,
          status: 'Rencana',
          periodId: period.id,
        },
        {
          name: 'Classmeet Akhir Tahun (Semester Ganjil)',
          description: 'Kegiatan perlombaan antar kelas setelah ujian semester ganjil selesai.',
          targetDate: `Desember ${startYear}`,
          status: 'Rencana',
          periodId: period.id,
        },
        {
          name: 'Classmeet Kenaikan Kelas (Semester Genap)',
          description: 'Kegiatan perlombaan antar kelas di pertengahan Juni sebelum pembagian rapor kenaikan kelas.',
          targetDate: `Juni ${endYear}`,
          status: 'Rencana',
          periodId: period.id,
        },
      ]
    });

    return period;
  }

  @Put('admin/periods/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async updatePeriod(@Param('id') id: string, @Body() body: any) {
    if (body.status === 'ACTIVE' || body.status === 'active') {
      await this.prisma.period.updateMany({
        where: { status: 'ACTIVE' },
        data: { status: 'INACTIVE' }
      });
    }

    const currentPeriod = await this.prisma.period.findUnique({
      where: { id }
    });

    let electedCandidateId = currentPeriod?.electedCandidateId || null;

    // Reset winner if voteEndDate has changed
    if (currentPeriod && body.voteEndDate !== undefined && body.voteEndDate !== currentPeriod.voteEndDate) {
      electedCandidateId = null;

      // Find roles
      const presidentRole = await this.prisma.role.findFirst({
        where: {
          OR: [
            { rolename: { equals: 'president', mode: 'insensitive' } },
            { rolename: { contains: 'president', mode: 'insensitive' } },
            { rolename: { contains: 'ketua', mode: 'insensitive' } }
          ]
        }
      });
      const vicePresidentRole = await this.prisma.role.findFirst({
        where: {
          OR: [
            { rolename: { equals: 'vice president', mode: 'insensitive' } },
            { rolename: { contains: 'vice', mode: 'insensitive' } },
            { rolename: { contains: 'wakil', mode: 'insensitive' } }
          ]
        }
      });

      const roleIdsToDelete = [presidentRole?.id, vicePresidentRole?.id].filter(Boolean) as string[];
      if (roleIdsToDelete.length > 0) {
        await this.prisma.organizationMember.deleteMany({
          where: {
            periodid: id,
            roleid: { in: roleIdsToDelete }
          }
        });
      }
    }

    return this.prisma.period.update({
      where: { id },
      data: {
        yearLabel: body.yearLabel,
        status: body.status,
        voteStartDate: body.voteStartDate || null,
        voteEndDate: body.voteEndDate || null,
        electedCandidateId
      }
    });
  }

  // Manage Role Endpoints
  @Get('admin/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair', 'student')
  async getRoles() {
    return this.prisma.role.findMany({
      where: { deletedAt: null },
      orderBy: { rolename: 'asc' },
    });
  }

  @Post('admin/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async createRole(@Body() body: any) {
    return this.prisma.role.create({
      data: {
        rolename: body.rolename,
      },
    });
  }

  @Put('admin/roles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async updateRole(@Param('id') id: string, @Body() body: any) {
    return this.prisma.role.update({
      where: { id },
      data: {
        rolename: body.rolename,
      },
    });
  }

  @Delete('admin/roles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async deleteRole(@Param('id') id: string) {
    return this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Manage Section Endpoints
  @Get('admin/sections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair', 'student')
  async getSections() {
    return this.prisma.section.findMany({
      where: { deletedAt: null },
      orderBy: { sectionname: 'asc' },
    });
  }

  @Post('admin/sections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async createSection(@Body() body: any) {
    return this.prisma.section.create({
      data: {
        sectionname: body.sectionname,
      },
    });
  }

  @Put('admin/sections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async updateSection(@Param('id') id: string, @Body() body: any) {
    return this.prisma.section.update({
      where: { id },
      data: {
        sectionname: body.sectionname,
      },
    });
  }

  @Delete('admin/sections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async deleteSection(@Param('id') id: string) {
    return this.prisma.section.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Manage Org Member Endpoints
  @Get('admin/org-members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair', 'student')
  async getOrgMembers() {
    await this.autoCheckElectedPairs();
    return this.prisma.organizationMember.findMany({
      include: {
        student: {
          include: {
            class: true,
            user: true
          }
        },
        role: true,
        period: true,
        section: true
      },
      orderBy: [
        { period: { yearLabel: 'desc' } },
        { role: { rolename: 'asc' } }
      ]
    });
  }

  @Post('admin/org-members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin', 'president', 'principal', 'student affair', 'kepala sekolah', 'wakasek kesiswaan', 'pembina osis')
  async createOrgMember(@Body() body: any) {
    if (body.studentid && body.periodid) {
      const student = await this.prisma.student.findUnique({
        where: { id: body.studentid },
        include: { class: { include: { grade: true } } }
      });
      if (!student) {
        throw new BadRequestException('Student tidak ditemukan');
      }
      this.validateOrganizationMemberGrade(student.class?.grade?.gradename || '');

      const existingStudentRole = await this.prisma.organizationMember.findFirst({
        where: { studentid: body.studentid, periodid: body.periodid }
      });
      if (existingStudentRole) {
        throw new BadRequestException('Student already has a role/position in this period.');
      }
    }

    if (body.roleid && body.periodid) {
      const role = await this.prisma.role.findUnique({ where: { id: body.roleid } });
      if (role) {
        const rName = role.rolename.toLowerCase();
        const isPres = rName === 'president' || rName.includes('president') || (rName.includes('ketua') && !rName.includes('wakil'));
        const isVicePres = rName === 'vice president' || rName.includes('vice president') || (rName.includes('wakil') && rName.includes('ketua'));

        if (isPres || isVicePres) {
          const matchingRoles = await this.prisma.role.findMany({
            where: {
              OR: isPres 
                ? [
                    { rolename: { equals: 'president', mode: 'insensitive' } },
                    { rolename: { contains: 'president', mode: 'insensitive' } },
                    { rolename: { contains: 'ketua osis', mode: 'insensitive' } }
                  ]
                : [
                    { rolename: { equals: 'vice president', mode: 'insensitive' } },
                    { rolename: { contains: 'vice', mode: 'insensitive' } },
                    { rolename: { contains: 'wakil', mode: 'insensitive' } }
                  ]
            }
          });
          const roleIds = matchingRoles.map(r => r.id);

          await this.prisma.organizationMember.deleteMany({
            where: {
              periodid: body.periodid,
              roleid: { in: roleIds }
            }
          });
        }
      }
    }

    return this.prisma.organizationMember.create({
      data: {
        studentid: body.studentid,
        roleid: body.roleid,
        periodid: body.periodid,
        sectionid: body.sectionid || null
      }
    });
  }

  @Put('admin/org-members/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin', 'president', 'principal', 'student affair', 'kepala sekolah', 'wakasek kesiswaan', 'pembina osis')
  async updateOrgMember(@Param('id') id: string, @Body() body: any) {
    if (body.studentid && body.periodid) {
      const student = await this.prisma.student.findUnique({
        where: { id: body.studentid },
        include: { class: { include: { grade: true } } }
      });
      if (!student) {
        throw new BadRequestException('Student tidak ditemukan');
      }
      this.validateOrganizationMemberGrade(student.class?.grade?.gradename || '');

      const existingStudentRole = await this.prisma.organizationMember.findFirst({
        where: { studentid: body.studentid, periodid: body.periodid, id: { not: id } }
      });
      if (existingStudentRole) {
        throw new BadRequestException('Student already has a role/position in this period.');
      }
    }
    if (body.roleid && body.periodid) {
      const role = await this.prisma.role.findUnique({ where: { id: body.roleid } });
      if (role) {
        const rName = role.rolename.toLowerCase();
        const isPres = rName === 'president' || rName.includes('president') || (rName.includes('ketua') && !rName.includes('wakil'));
        const isVicePres = rName === 'vice president' || rName.includes('vice president') || (rName.includes('wakil') && rName.includes('ketua'));

        if (isPres || isVicePres) {
          const matchingRoles = await this.prisma.role.findMany({
            where: {
              OR: isPres 
                ? [
                    { rolename: { equals: 'president', mode: 'insensitive' } },
                    { rolename: { contains: 'president', mode: 'insensitive' } },
                    { rolename: { contains: 'ketua osis', mode: 'insensitive' } }
                  ]
                : [
                    { rolename: { equals: 'vice president', mode: 'insensitive' } },
                    { rolename: { contains: 'vice', mode: 'insensitive' } },
                    { rolename: { contains: 'wakil', mode: 'insensitive' } }
                  ]
            }
          });
          const roleIds = matchingRoles.map(r => r.id);

          await this.prisma.organizationMember.deleteMany({
            where: {
              periodid: body.periodid,
              roleid: { in: roleIds },
              id: { not: id }
            }
          });
        }
      }
    }

    return this.prisma.organizationMember.update({
      where: { id },
      data: {
        studentid: body.studentid,
        roleid: body.roleid,
        periodid: body.periodid,
        sectionid: body.sectionid || null
      }
    });
  }

  @Delete('admin/org-members/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin', 'president', 'principal', 'student affair', 'kepala sekolah', 'wakasek kesiswaan', 'pembina osis')
  async deleteOrgMember(@Param('id') id: string) {
    return this.prisma.organizationMember.delete({
      where: { id }
    });
  }

  @Get('admin/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair', 'student')
  async getStudents() {
    return this.prisma.student.findMany({
      include: {
        class: {
          include: {
            grade: true,
            major: true
          }
        },
        user: true
      },
      orderBy: { user: { username: 'asc' } }
    });
  }

  @Post('auth/update-profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: any, @Body() body: any) {
    const userId = req.user.id;
    const userLevel = req.user.level;

    // 1. Update email in respective profile tables
    if (body.email) {
      if (userLevel === 'student') {
        const student = await this.prisma.student.findFirst({ where: { userid: userId } });
        if (student) {
          await this.prisma.student.update({
            where: { id: student.id },
            data: { email: body.email },
          });
        }
      } else if (userLevel === 'school') {
        const school = await this.prisma.school.findFirst({ where: { userid: userId } });
        if (school) {
          await this.prisma.school.update({
            where: { id: school.id },
            data: { email: body.email },
          });
        }
      } else if (userLevel === 'employer') {
        const employer = await this.prisma.employer.findFirst({ where: { userid: userId } });
        if (employer) {
          await this.prisma.employer.update({
            where: { id: employer.id },
            data: { email: body.email },
          });
        }
      }
    }

    // 2. Update password if provided
    if (body.password) {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    }

    return { success: true, message: 'Profil berhasil diperbarui' };
  }

  @Put('admin/classes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async updateClass(@Param('id') id: string, @Body() body: any) {
    const existing = await this.prisma.class.findUnique({ where: { id } });
    if (!existing) {
      throw new BadRequestException('Class tidak ditemukan');
    }

    const gradeId = body.gradeid || existing.gradeid;
    const majorId = body.majorid || existing.majorid;
    const grade = await this.prisma.grade.findUnique({ where: { id: gradeId } });
    const major = await this.prisma.major.findUnique({ where: { id: majorId } });

    if (!grade) {
      throw new BadRequestException('Grade tidak ditemukan');
    }
    if (!major) {
      throw new BadRequestException('Major tidak ditemukan');
    }

    this.validateClassMajorCombination(grade.gradename, major);

    return this.prisma.class.update({
      where: { id },
      data: {
        classname: body.classname,
        gradeid: gradeId,
        majorid: majorId,
      },
    });
  }

  @Put('admin/grades/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async updateGrade(@Param('id') id: string, @Body() body: any) {
    return this.prisma.grade.update({
      where: { id },
      data: {
        gradename: body.gradename,
      },
    });
  }

  @Put('admin/majors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async updateMajor(@Param('id') id: string, @Body() body: any) {
    return this.prisma.major.update({
      where: { id },
      data: {
        majorname: body.majorname,
        majorcode: body.majorcode,
      },
    });
  }

  @Put('admin/users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    const updateData: any = {};
    if (body.username) updateData.username = body.username;
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { level: true },
    });

    const levelname = user.level.levelname;
    if (levelname === 'student') {
      const student = await this.prisma.student.findFirst({ where: { userid: id } });
      if (student) {
        await this.prisma.student.update({
          where: { id: student.id },
          data: {
            email: body.email,
            classid: body.classid || null,
          },
        });
      }
    } else if (levelname === 'school') {
      const school = await this.prisma.school.findFirst({ where: { userid: id } });
      if (school) {
        const role = await this.prisma.role.findFirst({ where: { rolename: body.role || 'principal' } });
        if (!role) {
          throw new BadRequestException('Role sekolah tidak valid');
        }
        await this.prisma.school.update({
          where: { id: school.id },
          data: {
            email: body.email,
            roleid: role.id,
          },
        });
      }
    } else if (levelname === 'employer') {
      const employer = await this.prisma.employer.findFirst({ where: { userid: id } });
      if (employer) {
        const role = await this.prisma.role.findFirst({ where: { rolename: body.role || 'members' } });
        if (!role) {
          throw new BadRequestException('Role mitra tidak valid');
        }
        await this.prisma.employer.update({
          where: { id: employer.id },
          data: {
            email: body.email,
            roleid: role.id,
          },
        });
      }
    }
    return { success: true };
  }

  @Post('admin/users/:id/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async resetPassword(@Param('id') id: string, @Body() body: any) {
    if (!body.password || body.password.trim().length < 6) {
      throw new BadRequestException('Password minimal 6 karakter');
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    return { success: true, message: 'Password berhasil direset' };
  }

  // Candidates Endpoints
  @Get('admin/candidates')
  @UseGuards(JwtAuthGuard)
  async getCandidates() {
    return this.prisma.candidate.findMany({
      orderBy: { paslonNo: 'asc' }
    });
  }

  @Post('admin/candidates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async createCandidate(@Body() body: any) {
    await this.validateCandidateStudentGradeX(body.presidentId, 'Calon Ketua OSIS');
    await this.validateCandidateStudentGradeX(body.vicePresidentId, 'Calon Wakil Ketua OSIS');

    return this.prisma.candidate.create({
      data: {
        paslonNo: body.paslonNo,
        name: body.name,
        presidentId: body.presidentId,
        vicePresidentId: body.vicePresidentId,
        presidentName: body.presidentName,
        vicePresidentName: body.vicePresidentName,
        presidentClass: body.presidentClass,
        vicePresidentClass: body.vicePresidentClass,
        classes: body.classes,
        visi: body.visi,
        misi: body.misi || null,
        photo: body.photo || null,
        periodId: body.periodId
      }
    });
  }

  @Put('admin/candidates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async updateCandidate(@Param('id') id: string, @Body() body: any) {
    await this.validateCandidateStudentGradeX(body.presidentId, 'Calon Ketua OSIS');
    await this.validateCandidateStudentGradeX(body.vicePresidentId, 'Calon Wakil Ketua OSIS');

    return this.prisma.candidate.update({
      where: { id },
      data: {
        paslonNo: body.paslonNo,
        name: body.name,
        presidentId: body.presidentId,
        vicePresidentId: body.vicePresidentId,
        presidentName: body.presidentName,
        vicePresidentName: body.vicePresidentName,
        presidentClass: body.presidentClass,
        vicePresidentClass: body.vicePresidentClass,
        classes: body.classes,
        visi: body.visi,
        misi: body.misi || null,
        photo: body.photo || null,
        periodId: body.periodId
      }
    });
  }

  @Delete('admin/candidates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async deleteCandidate(@Param('id') id: string) {
    return this.prisma.candidate.delete({
      where: { id }
    });
  }

  // Votes Endpoints
  @Get('admin/votes')
  @UseGuards(JwtAuthGuard)
  async getVotes() {
    return this.prisma.vote.findMany();
  }

  @Post('admin/votes')
  @UseGuards(JwtAuthGuard)
  async castVote(@Request() req: any, @Body() body: any) {
    const userId = req.user.id;
    return this.prisma.vote.create({
      data: {
        userId,
        periodId: body.periodId,
        candidateId: body.candidateId
      }
    });
  }

  // Proker Endpoints
  @Get('admin/prokers')
  @UseGuards(JwtAuthGuard)
  async getProkers() {
    const periods = await this.prisma.period.findMany();
    
    const mandatoryList = [
      {
        name: 'MPLS (Masa Pengenalan Lingkungan Sekolah)',
        description: 'Kegiatan pengenalan lingkungan sekolah bagi siswa baru kelas VII / X.',
        monthName: 'Juli',
        isGenap: false
      },
      {
        name: 'Peringatan HUT RI',
        description: 'Penyelenggaraan berbagai perlombaan dan upacara bendera dalam rangka memperingati Hari Kemerdekaan Republik Indonesia.',
        monthName: 'Agustus',
        isGenap: false
      },
      {
        name: 'Hari Guru Nasional',
        description: 'Peringatan Hari Guru Nasional sebagai bentuk apresiasi terhadap jasa para guru.',
        monthName: 'November',
        isGenap: false
      },
      {
        name: 'Classmeet Akhir Tahun (Semester Ganjil)',
        description: 'Kegiatan perlombaan antar kelas setelah ujian semester ganjil selesai.',
        monthName: 'Desember',
        isGenap: false
      },
      {
        name: 'Classmeet Kenaikan Kelas (Semester Genap)',
        description: 'Kegiatan perlombaan antar kelas di pertengahan Juni sebelum pembagian rapor kenaikan kelas.',
        monthName: 'Juni',
        isGenap: true
      }
    ];

    for (const period of periods) {
      const existingProkers = await this.prisma.proker.findMany({
        where: { periodId: period.id }
      });
      const existingNames = existingProkers.map(p => p.name);

      const startYear = period.yearLabel.split('/')[0];
      const endYear = period.yearLabel.split('/')[1] || String(Number(startYear) + 1);

      for (const item of mandatoryList) {
        if (!existingNames.includes(item.name)) {
          const targetYear = item.isGenap ? endYear : startYear;
          await this.prisma.proker.create({
            data: {
              name: item.name,
              description: item.description,
              targetDate: `${item.monthName} ${targetYear}`,
              status: 'Rencana',
              periodId: period.id
            }
          });
        }
      }
    }

    return this.prisma.proker.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post('admin/prokers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris')
  async createProker(@Body() body: any) {
    return this.prisma.proker.create({
      data: {
        name: body.name,
        description: body.description || null,
        targetDate: body.targetDate,
        status: body.status,
        periodId: body.periodId,
        candidateId: body.candidateId || null
      }
    });
  }

  @Put('admin/prokers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris')
  async updateProker(@Param('id') id: string, @Body() body: any) {
    const existing = await this.prisma.proker.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new BadRequestException('Program kerja tidak ditemukan');
    }

    const mandatoryProkers = [
      'MPLS (Masa Pengenalan Lingkungan Sekolah)',
      'Peringatan HUT RI',
      'Hari Guru Nasional',
      'Classmeet Akhir Tahun (Semester Ganjil)',
      'Classmeet Kenaikan Kelas (Semester Genap)',
    ];

    if (mandatoryProkers.includes(existing.name) && existing.name !== body.name) {
      throw new BadRequestException(
        `Nama program kerja wajib '${existing.name}' tidak dapat diubah.`,
      );
    }

    return this.prisma.proker.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        targetDate: body.targetDate,
        status: body.status,
        periodId: body.periodId,
        candidateId: body.candidateId || null
      }
    });
  }

  @Delete('admin/prokers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris')
  async deleteProker(@Param('id') id: string) {
    const existing = await this.prisma.proker.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new BadRequestException('Program kerja tidak ditemukan');
    }

    const mandatoryProkers = [
      'MPLS (Masa Pengenalan Lingkungan Sekolah)',
      'Peringatan HUT RI',
      'Hari Guru Nasional',
      'Classmeet Akhir Tahun (Semester Ganjil)',
      'Classmeet Kenaikan Kelas (Semester Genap)',
    ];

    if (mandatoryProkers.includes(existing.name)) {
      throw new BadRequestException(
        `Program kerja wajib '${existing.name}' tidak dapat dihapus.`,
      );
    }

    return this.prisma.proker.delete({
      where: { id }
    });
  }

  @Post('admin/periods/:id/elected-pair')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async setElectedPair(@Param('id') id: string, @Body() body: any) {
    const candidateId = body.candidateId || null;

    // 1. Update the period's elected candidate ID
    const updatedPeriod = await this.prisma.period.update({
      where: { id },
      data: {
        electedCandidateId: candidateId
      }
    });

    // 2. Find all candidates in this period
    const periodCandidates = await this.prisma.candidate.findMany({
      where: { periodId: id }
    });

    if (periodCandidates.length > 0) {
      // 3. Find the roles for 'president' and 'vice president' (case-insensitive & fallback options)
      let presidentRole = await this.prisma.role.findFirst({
        where: {
          OR: [
            { rolename: { equals: 'president', mode: 'insensitive' } },
            { rolename: { contains: 'president', mode: 'insensitive' } },
            { rolename: { contains: 'ketua', mode: 'insensitive' } }
          ]
        }
      });
      let vicePresidentRole = await this.prisma.role.findFirst({
        where: {
          OR: [
            { rolename: { equals: 'vice president', mode: 'insensitive' } },
            { rolename: { contains: 'vice', mode: 'insensitive' } },
            { rolename: { contains: 'wakil', mode: 'insensitive' } }
          ]
        }
      });

      if (!presidentRole) {
        presidentRole = await this.prisma.role.create({
          data: { rolename: 'president' }
        });
      }
      if (!vicePresidentRole) {
        vicePresidentRole = await this.prisma.role.create({
          data: { rolename: 'vice president' }
        });
      }

      for (const candidate of periodCandidates) {
        const isWinner = candidateId && candidate.id === candidateId;

        // Update President student (Winner -> add to OrganizationMember, Loser/Reset -> remove from OrganizationMember)
        if (candidate.presidentId && candidate.presidentId !== '-') {
          const student = await this.prisma.student.findFirst({
            where: { userid: candidate.presidentId }
          });
          if (student) {
            await this.prisma.organizationMember.deleteMany({
              where: {
                studentid: student.id,
                periodid: id
              }
            });

            if (isWinner && presidentRole) {
              await this.prisma.organizationMember.create({
                data: {
                  studentid: student.id,
                  periodid: id,
                  roleid: presidentRole.id
                }
              });
            }
          }
        }

        // Update Vice President student
        if (candidate.vicePresidentId && candidate.vicePresidentId !== '-') {
          const student = await this.prisma.student.findFirst({
            where: { userid: candidate.vicePresidentId }
          });
          if (student) {
            await this.prisma.organizationMember.deleteMany({
              where: {
                studentid: student.id,
                periodid: id
              }
            });

            if (isWinner && vicePresidentRole) {
              await this.prisma.organizationMember.create({
                data: {
                  studentid: student.id,
                  periodid: id,
                  roleid: vicePresidentRole.id
                }
              });
            }
          }
        }
      }
    }

  }

  @Get('admin/kas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair')
  async getKasData(
    @Query('month') monthStr?: string,
    @Query('year') yearStr?: string,
  ) {
    const now = new Date();
    const month = monthStr ? parseInt(monthStr, 10) : now.getMonth() + 1;
    const year = yearStr ? parseInt(yearStr, 10) : now.getFullYear();

    if (isNaN(month) || month < 1 || month > 12) {
      throw new BadRequestException('Bulan tidak valid (harus 1-12)');
    }
    if (isNaN(year)) {
      throw new BadRequestException('Tahun tidak valid');
    }

    const activePeriod = await this.prisma.period.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!activePeriod) {
      return {
        activePeriod: null,
        classes: [],
      };
    }

    const classes = await this.prisma.class.findMany({
      include: {
        grade: true,
        major: true,
        _count: {
          select: { students: true },
        },
        kasPayments: {
          where: {
            periodId: activePeriod.id,
            month,
            year,
          },
        },
      },
      orderBy: [
        { grade: { gradename: 'asc' } },
        { major: { majorcode: 'asc' } },
        { classname: 'asc' },
      ],
    });

    const totalAccumulated = await this.prisma.kasPayment.aggregate({
      where: {
        periodId: activePeriod.id,
      },
      _sum: {
        amount: true,
      },
    });
    const accumulatedTotal = totalAccumulated._sum.amount || 0;

    return {
      activePeriod,
      selectedMonth: month,
      selectedYear: year,
      accumulatedTotal,
      classes: classes.map((cls) => {
        const isPaid = cls.kasPayments.length > 0;
        const paidAmount = isPaid ? cls.kasPayments[0].amount : 0;
        const studentCount = isPaid ? Math.round(paidAmount / 5000) : cls._count.students;
        const requiredPayment = isPaid ? paidAmount : cls._count.students * 5000;
        return {
          id: cls.id,
          classname: cls.classname,
          grade: cls.grade.gradename,
          major: cls.major.majorname,
          majorCode: cls.major.majorcode,
          studentCount,
          requiredPayment,
          isPaid,
          paidAt: isPaid ? cls.kasPayments[0].createdAt : null,
        };
      }),
    };
  }

  @Post('admin/kas/pay')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'treasurer', 'president', 'vice president')
  async recordPayment(
    @Body() body: any,
  ) {
    const { classId } = body;
    const month = body.month ? parseInt(body.month, 10) : undefined;
    const year = body.year ? parseInt(body.year, 10) : undefined;

    if (!classId) {
      throw new BadRequestException('Class ID is required');
    }
    if (!month || isNaN(month) || month < 1 || month > 12) {
      throw new BadRequestException('Bulan tidak valid (harus 1-12)');
    }
    if (!year || isNaN(year)) {
      throw new BadRequestException('Tahun tidak valid');
    }

    const activePeriod = await this.prisma.period.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!activePeriod) {
      throw new BadRequestException('Tidak ada periode aktif saat ini.');
    }

    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    if (!cls) {
      throw new BadRequestException('Kelas tidak ditemukan');
    }

    const existing = await this.prisma.kasPayment.findUnique({
      where: {
        classId_periodId_month_year: {
          classId,
          periodId: activePeriod.id,
          month,
          year,
        },
      },
    });

    if (existing) {
      return existing;
    }

    const studentCount = cls._count.students;
    const amount = studentCount * 5000;

    return this.prisma.kasPayment.create({
      data: {
        classId,
        periodId: activePeriod.id,
        month,
        year,
        amount,
      },
    });
  }

  @Get('admin/activity-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async getActivityLogs() {
    return this.prisma.activityLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
  }

  @Get('admin/recycle-bin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async getRecycleBin() {
    const classes = await this.prisma.class.findMany({
      where: { deletedAt: { not: null } },
      include: { grade: true, major: true },
      orderBy: { deletedAt: 'desc' },
    });
    const grades = await this.prisma.grade.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
    });
    const majors = await this.prisma.major.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
    });
    const usersRaw = await this.prisma.user.findMany({
      where: { deletedAt: { not: null } },
      include: {
        level: true,
        students: { include: { class: true } },
        schools: { include: { role: true } },
        employers: { include: { role: true } },
      },
      orderBy: { deletedAt: 'desc' },
    });
    const users = usersRaw.map(u => {
      let email = '-';
      let role = '-';
      let classname = '-';
      if (u.level.levelname === 'student' && u.students.length > 0) {
        email = u.students[0].email;
        classname = u.students[0].class?.classname || '-';
        role = 'student';
      } else if (u.level.levelname === 'school' && u.schools.length > 0) {
        email = u.schools[0].email;
        role = u.schools[0].role.rolename;
      } else if (u.level.levelname === 'employer' && u.employers.length > 0) {
        email = u.employers[0].email;
        role = u.employers[0].role.rolename;
      }
      return {
        id: u.id,
        username: u.username,
        level: u.level.levelname,
        email,
        role,
        classname,
        deletedAt: u.deletedAt
      };
    });
    const roles = await this.prisma.role.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
    });
    const sections = await this.prisma.section.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
    });
    return {
      classes,
      grades,
      majors,
      users,
      roles,
      sections,
    };
  }

  @Post('admin/recycle-bin/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async restoreRecycleBinItem(@Body() body: { type: string; id: string }) {
    const { type, id } = body;
    switch (type) {
      case 'class':
        return this.prisma.class.update({
          where: { id },
          data: { deletedAt: null },
        });
      case 'grade':
        return this.prisma.grade.update({
          where: { id },
          data: { deletedAt: null },
        });
      case 'major':
        return this.prisma.major.update({
          where: { id },
          data: { deletedAt: null },
        });
      case 'user':
        await this.prisma.student.updateMany({
          where: { userid: id },
          data: { deletedAt: null },
        });
        await this.prisma.school.updateMany({
          where: { userid: id },
          data: { deletedAt: null },
        });
        await this.prisma.employer.updateMany({
          where: { userid: id },
          data: { deletedAt: null },
        });
        return this.prisma.user.update({
          where: { id },
          data: { deletedAt: null },
        });
      case 'role':
        return this.prisma.role.update({
          where: { id },
          data: { deletedAt: null },
        });
      case 'section':
        return this.prisma.section.update({
          where: { id },
          data: { deletedAt: null },
        });
      default:
        throw new BadRequestException('Tipe data tidak didukung');
    }
  }

  @Get('admin/permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async getPermissions() {
    const baseRoles = [
      'superadmin',
      'admin',
      'president',
      'vice president',
      'treasurer',
      'secretaris',
      'principal',
      'viceprincipal',
      'student affair',
      'student',
      'member',
      'members'
    ];

    const dbRoles = await this.prisma.role.findMany({
      select: { rolename: true },
      orderBy: { rolename: 'asc' },
    });

    const roleMap = new Map<string, string>();
    for (const roleName of [...baseRoles, ...dbRoles.map(r => r.rolename)]) {
      const normalized = (roleName || '').trim();
      if (!normalized) continue;
      const key = normalized.toLowerCase();
      if (!roleMap.has(key)) {
        roleMap.set(key, normalized);
      }
    }

    const rolesList = Array.from(roleMap.values());

    const menuKeys = [
      'kandidat',
      'proker',
      'organization',
      'kas',
      'evaluasi-kinerja',
      'activity-log',
      'recycle-bin',
      'vote',
      'manage-class',
      'manage-grade',
      'manage-major',
      'manage-period',
      'manage-user',
      'manage-role',
      'manage-section',
      'system-setting',
      'backup-db'
    ];

    const existing = await this.prisma.menuPermission.findMany();

    const hasDefaultPermission = (roleName: string, menuKey: string) => {
      const r = roleName.trim().toLowerCase();
      const m = menuKey.trim().toLowerCase();

      if (r === 'superadmin' || r === 'admin') {
        return true;
      }

      const officerMenus = ['proker', 'organization', 'kas', 'evaluasi-kinerja', 'vote'];
      const studentMenus = ['proker', 'organization', 'kas', 'vote'];

      const isPresident = r === 'president' || r.includes('president') || r.includes('ketua');
      const isVicePresident = r === 'vice president' || (r.includes('vice') && r.includes('president')) || (r.includes('wakil') && r.includes('ketua'));
      const isTreasurer = r === 'treasurer' || r.includes('treasurer') || r.includes('bendahara');
      const isSecretary = r === 'secretaris' || r.includes('secretary') || r.includes('sekretaris');
      const isPrincipal = r === 'principal' || r.includes('principal') || r.includes('kepala sekolah');
      const isVicePrincipal = r === 'viceprincipal' || r.includes('vice principal') || r.includes('wakasek') || (r.includes('wakil') && r.includes('kepala'));
      const isStudentAffair = r === 'student affair' || r.includes('student affair') || r.includes('kesiswaan') || r.includes('pembina osis');
      const isStudentLike = r === 'student' || r === 'member' || r === 'members' || r.includes('student') || r.includes('member');

      if (isPresident && ['kandidat', ...officerMenus].includes(m)) return true;
      if ((isVicePresident || isTreasurer || isSecretary || isPrincipal || isVicePrincipal || isStudentAffair) && officerMenus.includes(m)) return true;
      if (isStudentLike && studentMenus.includes(m)) return true;
      return false;
    };

    const toCreate: any[] = [];
    for (const r of rolesList) {
      for (const m of menuKeys) {
        const found = existing.some(ex => (ex.roleName || '').trim().toLowerCase() === r.trim().toLowerCase() && ex.menuKey === m);
        if (!found) {
          toCreate.push({ roleName: r, menuKey: m, allowed: hasDefaultPermission(r, m) });
        }
      }
    }

    if (toCreate.length > 0) {
      await this.prisma.menuPermission.createMany({
        data: toCreate
      });
    }

    return this.prisma.menuPermission.findMany({
      orderBy: [
        { roleName: 'asc' },
        { menuKey: 'asc' }
      ]
    });
  }

  @Post('admin/permissions/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async updatePermission(@Body() body: { roleName: string; menuKey: string; allowed: boolean }) {
    return this.prisma.menuPermission.upsert({
      where: {
        roleName_menuKey: {
          roleName: body.roleName,
          menuKey: body.menuKey
        }
      },
      update: {
        allowed: body.allowed
      },
      create: {
        roleName: body.roleName,
        menuKey: body.menuKey,
        allowed: body.allowed
      }
    });
  }

  @Get('permissions/my')
  @UseGuards(JwtAuthGuard)
  async getMyPermissions(@Request() req: any) {
    const user = req.user;
    const normalizeRoleName = (roleName: string) => {
      const r = (roleName || '').trim().toLowerCase();
      if (!r) return 'student';

      if (r === 'secretary 1' || r === 'secretary 2' || r === 'sekretaris 1' || r === 'sekretaris 2') {
        return 'secretaris';
      }

      if (r === 'treasurer 1' || r === 'treasurer 2' || r === 'bendahara 1' || r === 'bendahara 2') {
        return 'treasurer';
      }

      if (r === 'vice principal' || r === 'vice principal 1' || r === 'vice principal 2' || r === 'wakil kepala sekolah') {
        return 'viceprincipal';
      }

      if (r === 'student affair' || r === 'student affairs' || r === 'wakasek kesiswaan' || r === 'pembina osis') {
        return 'student affair';
      }

      if (r === 'member' || r === 'members') {
        return 'student';
      }

      return r;
    };

    const getRoleAliases = (roleName: string) => {
      const normalized = normalizeRoleName(roleName);
      const aliases = new Set<string>([normalized]);

      if (normalized === 'secretaris') {
        aliases.add('secretary 1');
        aliases.add('secretary 2');
        aliases.add('sekretaris 1');
        aliases.add('sekretaris 2');
      }

      if (normalized === 'treasurer') {
        aliases.add('treasurer 1');
        aliases.add('treasurer 2');
        aliases.add('bendahara 1');
        aliases.add('bendahara 2');
      }

      if (normalized === 'viceprincipal') {
        aliases.add('vice principal');
        aliases.add('vice principal 1');
        aliases.add('vice principal 2');
        aliases.add('wakil kepala sekolah');
      }

      if (normalized === 'student affair') {
        aliases.add('student affairs');
        aliases.add('wakasek kesiswaan');
        aliases.add('pembina osis');
      }

      if (normalized === 'student') {
        aliases.add('member');
        aliases.add('members');
      }

      return Array.from(aliases);
    };

    const roleName = normalizeRoleName(user.role || 'student');
    const roleAliases = getRoleAliases(roleName);
    const permissions = await this.prisma.menuPermission.findMany();
    return permissions
      .filter(p => roleAliases.includes((p.roleName || '').trim().toLowerCase()) && p.allowed)
      .map(p => p.menuKey);
  }
}

