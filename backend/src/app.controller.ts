import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
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
  @Roles('superadmin')
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
  @Roles('superadmin')
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
  @Roles('superadmin')
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
  @Roles('superadmin')
  async getUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        level: true,
        students: { include: { role: true, class: true } },
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
        email = u.students[0].email;
        role = u.students[0].role?.rolename || 'student';
        classname = u.students[0].class?.classname || '-';
        classid = u.students[0].classid || '';
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
      const role = await this.prisma.role.findFirst({
        where: { rolename: body.role || 'members' },
      });
      await this.prisma.student.create({
        data: {
          userid: newUser.id,
          email: body.email,
          classid: body.classid || null,
          roleid: role?.id || null,
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

  // Manage Period (Database-backed)
  @Get('admin/periods')
  @UseGuards(JwtAuthGuard)
  async getPeriods() {
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
    return this.prisma.period.create({
      data: {
        yearLabel: body.yearLabel,
        status: body.status,
        voteStartDate: body.voteStartDate || null,
        voteEndDate: body.voteEndDate || null
      }
    });
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
    return this.prisma.period.update({
      where: { id },
      data: {
        yearLabel: body.yearLabel,
        status: body.status,
        voteStartDate: body.voteStartDate || null,
        voteEndDate: body.voteEndDate || null
      }
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
        const role = body.role ? await this.prisma.role.findFirst({ where: { rolename: body.role } }) : null;
        await this.prisma.student.update({
          where: { id: student.id },
          data: {
            email: body.email,
            classid: body.classid || null,
            roleid: role?.id || null,
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
    return this.prisma.proker.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post('admin/prokers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async createProker(@Body() body: any) {
    return this.prisma.proker.create({
      data: {
        name: body.name,
        description: body.description || null,
        targetDate: body.targetDate,
        status: body.status,
        periodId: body.periodId
      }
    });
  }

  @Put('admin/prokers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async updateProker(@Param('id') id: string, @Body() body: any) {
    return this.prisma.proker.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        targetDate: body.targetDate,
        status: body.status,
        periodId: body.periodId
      }
    });
  }

  @Delete('admin/prokers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async deleteProker(@Param('id') id: string) {
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
      // 3. Find the roles for 'president' and 'vice president'
      const presidentRole = await this.prisma.role.findFirst({
        where: { rolename: { equals: 'president', mode: 'insensitive' } }
      });
      const vicePresidentRole = await this.prisma.role.findFirst({
        where: { rolename: { equals: 'vice president', mode: 'insensitive' } }
      });

      for (const candidate of periodCandidates) {
        const isWinner = candidateId && candidate.id === candidateId;

        // Update President student (Winner -> president role, Loser -> null)
        if (candidate.presidentId && candidate.presidentId !== '-') {
          const student = await this.prisma.student.findFirst({
            where: { userid: candidate.presidentId }
          });
          if (student) {
            await this.prisma.student.update({
              where: { id: student.id },
              data: {
                roleid: isWinner && presidentRole ? presidentRole.id : null
              }
            });
          }
        }

        // Update Vice President student (Winner -> vice president role, Loser -> null)
        if (candidate.vicePresidentId && candidate.vicePresidentId !== '-') {
          const student = await this.prisma.student.findFirst({
            where: { userid: candidate.vicePresidentId }
          });
          if (student) {
            await this.prisma.student.update({
              where: { id: student.id },
              data: {
                roleid: isWinner && vicePresidentRole ? vicePresidentRole.id : null
              }
            });
          }
        }
      }
    }

    return updatedPeriod;
  }

  // Kas OSIS Endpoints
  @Get('admin/kas-claims')
  @UseGuards(JwtAuthGuard)
  async getKasClaims() {
    return this.prisma.kasClaim.findMany();
  }

  @Post('admin/kas-claims')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async claimKas(@Body() body: any) {
    return this.prisma.kasClaim.upsert({
      where: {
        monthKey_classId: {
          monthKey: body.monthKey,
          classId: body.classId
        }
      },
      update: {
        claimed: body.claimed
      },
      create: {
        monthKey: body.monthKey,
        classId: body.classId,
        claimed: body.claimed
      }
    });
  }

  @Get('admin/kas-expenses')
  @UseGuards(JwtAuthGuard)
  async getKasExpenses() {
    return this.prisma.kasExpense.findMany({
      orderBy: { date: 'desc' }
    });
  }

  @Post('admin/kas-expenses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async createKasExpense(@Body() body: any) {
    return this.prisma.kasExpense.create({
      data: {
        description: body.description,
        amount: Number(body.amount),
        date: body.date
      }
    });
  }

  @Delete('admin/kas-expenses/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  async deleteKasExpense(@Param('id') id: string) {
    return this.prisma.kasExpense.delete({
      where: { id }
    });
  }
}
