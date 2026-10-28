import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAccountDto } from "./dto/create-account.dto";

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAccountDto) {
    return this.prisma.account.create({ data: { name: dto.name } });
  }

  async findAll(page: number, limit: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.account.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.account.count(),
    ]);
    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const account = await this.prisma.account.findUnique({ where: { id } });
    if (!account) throw new NotFoundException("Account not found");
    return account;
  }

  async getBalance(id: number) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      select: { id: true, balance: true },
    });
    if (!account) throw new NotFoundException("Account not found");
    return { account_id: account.id, balance: account.balance };
  }
}
