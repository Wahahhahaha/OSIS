import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        level: true,
        students: {
          include: {
            class: {
              include: {
                grade: true,
                major: true,
              },
            },
            role: true,
          },
        },
        schools: {
          include: {
            role: true,
          },
        },
        employers: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        level: true,
        students: {
          include: {
            class: {
              include: {
                grade: true,
                major: true,
              },
            },
            role: true,
          },
        },
        schools: {
          include: {
            role: true,
          },
        },
        employers: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }
}
