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
    return this.prisma.class.delete({
      where: { id },
    });
  }

  // Manage Grade Endpoints
  @Get('admin/grades')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair')
  async getGrades() {
    return this.prisma.grade.findMany({
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
    return this.prisma.grade.delete({
      where: { id },
    });
  }

  // Manage Major Endpoints
  @Get('admin/majors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair')
  async getMajors() {
    return this.prisma.major.findMany({
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
    return this.prisma.major.delete({
      where: { id },
    });
  }

  // Manage User Endpoints
  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair')
  async getUsers() {
    const users = await this.prisma.user.findMany({
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
          || s.organizationMembers[0];
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
    await this.prisma.student.deleteMany({ where: { userid: id } });
    await this.prisma.school.deleteMany({ where: { userid: id } });
    await this.prisma.employer.deleteMany({ where: { userid: id } });
    return this.prisma.user.delete({ where: { id } });
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

        // Check if there is already an organization member mapped for president and vice president in this period
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
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair')
  async getRoles() {
    return this.prisma.role.findMany({
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
    try {
      return await this.prisma.role.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Peran (Role) tidak dapat dihapus karena sedang digunakan oleh data lain (sekolah, mitra, atau anggota organisasi).',
        );
      }
      throw error;
    }
  }

  // Manage Section Endpoints
  @Get('admin/sections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair')
  async getSections() {
    return this.prisma.section.findMany({
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
    return this.prisma.section.delete({
      where: { id },
    });
  }

  // Manage Org Member Endpoints
  @Get('admin/org-members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair')
  async getOrgMembers() {
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
  @Roles('superadmin')
  async createOrgMember(@Body() body: any) {
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
  @Roles('superadmin')
  async updateOrgMember(@Param('id') id: string, @Body() body: any) {
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
  @Roles('superadmin')
  async deleteOrgMember(@Param('id') id: string) {
    return this.prisma.organizationMember.delete({
      where: { id }
    });
  }

  @Get('admin/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president', 'vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair')
  async getStudents() {
    return this.prisma.student.findMany({
      include: {
        class: true,
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
    return this.prisma.class.update({
      where: { id },
      data: {
        classname: body.classname,
        gradeid: body.gradeid,
        majorid: body.majorid,
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
      classes: classes.map((cls) => ({
        id: cls.id,
        classname: cls.classname,
        grade: cls.grade.gradename,
        major: cls.major.majorname,
        majorCode: cls.major.majorcode,
        studentCount: cls._count.students,
        requiredPayment: cls._count.students * 5000,
        isPaid: cls.kasPayments.length > 0,
        paidAt: cls.kasPayments.length > 0 ? cls.kasPayments[0].createdAt : null,
      })),
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
}

