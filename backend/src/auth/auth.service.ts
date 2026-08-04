import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  private normalizeRoleName(roleName: string) {
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
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByUsername(dto.username);
    if (existingUser) {
      throw new ConflictException('Username sudah digunakan oleh akun lain');
    }

    const level = await this.prisma.level.findUnique({
      where: { levelname: dto.levelname },
    });
    if (!level) {
      throw new BadRequestException(`Level '${dto.levelname}' tidak valid`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        levelId: level.id,
      },
    });

    if (dto.levelname === 'student') {
      const cls = await this.prisma.class.findFirst({
        where: { classname: dto.classname || 'X RPL 1' },
      });
      if (!cls) {
        throw new BadRequestException('Kelas tidak ditemukan');
      }
      
      await this.prisma.student.create({
        data: {
          userid: user.id,
          email: dto.email,
          classid: cls.id,
        },
      });
    } else if (dto.levelname === 'school') {
      const role = await this.prisma.role.findFirst({
        where: { rolename: dto.rolename || 'principal' },
      });
      if (!role) {
        throw new BadRequestException('Role sekolah tidak valid');
      }

      await this.prisma.school.create({
        data: {
          userid: user.id,
          email: dto.email,
          roleid: role.id,
        },
      });
    } else if (dto.levelname === 'employer') {
      const role = await this.prisma.role.findFirst({
        where: { rolename: dto.rolename || 'members' },
      });
      if (!role) {
        throw new BadRequestException('Role employer tidak valid');
      }

      await this.prisma.employer.create({
        data: {
          userid: user.id,
          email: dto.email,
          roleid: role.id,
        },
      });
    }

    const createdUser = await this.usersService.findOne(user.id);
    if (!createdUser) {
      throw new BadRequestException('Gagal membuat user');
    }
    const { password: _, ...result } = createdUser;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const payload = { sub: user.id, username: user.username, level: user.level.levelname };
    const accessToken = await this.jwtService.signAsync(payload);

    let email = '';
    let roleName = '';
    let details: any = null;

    if (user.level.levelname === 'superadmin') {
      roleName = 'superadmin';
    } else if (user.level.levelname === 'student' && user.students.length > 0) {
      const s = user.students[0];
      email = s.email;

      const activeMember = s.organizationMembers.find(om => om.period.status.toLowerCase() === 'active') 
        || s.organizationMembers[0];

      roleName = this.normalizeRoleName(activeMember?.role?.rolename || 'student');
      const sectionName = activeMember?.section?.sectionname || null;

      details = {
        class: s.class.classname,
        grade: s.class.grade.gradename,
        major: s.class.major.majorname,
        section: sectionName,
      };
    } else if (user.level.levelname === 'school' && user.schools.length > 0) {
      const sc = user.schools[0];
      email = sc.email;
      roleName = this.normalizeRoleName(sc.role.rolename);
    } else if (user.level.levelname === 'employer' && user.employers.length > 0) {
      const emp = user.employers[0];
      email = emp.email;
      roleName = this.normalizeRoleName(emp.role.rolename);
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        level: user.level.levelname,
        email,
        role: roleName,
        details,
      },
      accessToken,
    };
  }
}
