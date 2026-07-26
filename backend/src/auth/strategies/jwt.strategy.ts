import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecretOSIS2026',
    });
  }

  async validate(payload: { sub: string; username: string; level: string }) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan atau token tidak valid');
    }

    let email = '';
    let role = '';
    let details: any = null;

    if (user.level.levelname === 'student' && user.students.length > 0) {
      const s = user.students[0];
      email = s.email;
      role = s.role?.rolename || 'student';
      details = {
        class: s.class.classname,
        grade: s.class.grade.gradename,
        major: s.class.major.majorname,
      };
    } else if (user.level.levelname === 'school' && user.schools.length > 0) {
      const sc = user.schools[0];
      email = sc.email;
      role = sc.role.rolename;
    } else if (user.level.levelname === 'employer' && user.employers.length > 0) {
      const emp = user.employers[0];
      email = emp.email;
      role = emp.role.rolename;
    }

    return {
      id: user.id,
      username: user.username,
      level: user.level.levelname,
      email,
      role,
      details,
    };
  }
}
