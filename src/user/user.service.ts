import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) {}

    async findByEmail(email: string): Promise<User | undefined> {
        return this.prismaService.user.findUnique({
            where: {
                email: email
            }
        });
    }

    async findByUserName(userName: string): Promise<User | undefined> {
        return this.prismaService.user.findUnique({
            where: {
                userName: userName
            }
        });
    }

    async create(userCreate: Prisma.UserCreateInput): Promise<User | null> {
        return this.prismaService.user.create({
            data: userCreate
        });
    }
}
