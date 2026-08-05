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

  private normalizeRoleName(roleName: string) {
    const r = (roleName || '').trim().toLowerCase();
    if (!r) return 'student';

    if (r === 'secretary' || r === 'secretaris' || r === 'sekretaris' || r === 'secretary 1' || r === 'secretary 2' || r === 'sekretaris 1' || r === 'sekretaris 2') {
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
      role = this.normalizeRoleName(activeMember?.role?.rolename || 'student');
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
      role = this.normalizeRoleName(sc.role.rolename);
    } else if (user.level.levelname === 'employer' && user.employers.length > 0) {
      const emp = user.employers[0];
      email = emp.email;
      role = this.normalizeRoleName(emp.role.rolename);
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
