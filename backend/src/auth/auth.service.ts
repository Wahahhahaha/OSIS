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
      
      let roleId: string | null = null;
      if (dto.rolename) {
        const role = await this.prisma.role.findUnique({ where: { rolename: dto.rolename } });
        if (role) roleId = role.id;
      }

      await this.prisma.student.create({
        data: {
          userid: user.id,
          email: dto.email,
          classid: cls.id,
          roleid: roleId,
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

    if (user.level.levelname === 'student' && user.students.length > 0) {
      const s = user.students[0];
      email = s.email;
      roleName = s.role?.rolename || 'student';
      details = {
        class: s.class.classname,
        grade: s.class.grade.gradename,
        major: s.class.major.majorname,
      };
    } else if (user.level.levelname === 'school' && user.schools.length > 0) {
      const sc = user.schools[0];
      email = sc.email;
      roleName = sc.role.rolename;
    } else if (user.level.levelname === 'employer' && user.employers.length > 0) {
      const emp = user.employers[0];
      email = emp.email;
      roleName = emp.role.rolename;
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
