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

    if (user.level.levelname === 'superadmin') {
      role = 'superadmin';
    } else if (user.level.levelname === 'student' && user.students.length > 0) {
      const s = user.students[0];
      email = s.email;
      const activeMember = s.organizationMembers.find(om => om.period.status.toLowerCase() === 'active') 
        || s.organizationMembers[0];
      role = (activeMember?.role?.rolename || 'student').toLowerCase();
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
      role = sc.role.rolename.toLowerCase();
    } else if (user.level.levelname === 'employer' && user.employers.length > 0) {
      const emp = user.employers[0];
      email = emp.email;
      role = emp.role.rolename.toLowerCase();
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
