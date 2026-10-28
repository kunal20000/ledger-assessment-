import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, TransactionType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";

function amountOf(value: string) {
  if (!/^\d+(\.\d{1,4})?$/.test(value) || Number(value) <= 0)
    throw new BadRequestException("Amount must be greater than zero");
  return new Prisma.Decimal(value);
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(accountId: number, dto: CreateTransactionDto) {
    const amount = amountOf(dto.amount);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const account = await tx.account.findUnique({
          where: { id: accountId },
        });
        if (!account) throw new NotFoundException("Account not found");
        if (
          dto.type === TransactionType.debit &&
          account.balance.lessThan(amount)
        )
          throw new BadRequestException("Insufficient balance");
        // The conditional update is important: it makes concurrent debits safe.
        // A read-then-write balance update could allow two requests to overspend.
        const balanceUpdate =
          dto.type === TransactionType.credit
            ? await tx.account.updateMany({
                where: { id: accountId },
                data: { balance: { increment: amount } },
              })
            : await tx.account.updateMany({
                where: { id: accountId, balance: { gte: amount } },
                data: { balance: { decrement: amount } },
              });
        if (balanceUpdate.count !== 1) {
          throw new BadRequestException("Insufficient balance");
        }
        const transaction = await tx.transaction.create({
          data: {
            accountId,
            type: dto.type as TransactionType,
            amount,
            referenceId: dto.referenceId.trim(),
          },
        });
        const description = dto.description?.trim() || null;
        const [{ exists: hasDescriptionColumn }] = await tx.$queryRaw<
          Array<{ exists: boolean }>
        >(Prisma.sql`SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Transaction' AND column_name = 'description'
        ) AS exists`);
        if (hasDescriptionColumn) {
          await tx.$executeRaw(
            Prisma.sql`UPDATE "Transaction" SET "description" = ${description} WHERE "id" = ${transaction.id}`
          );
        }
        return { ...transaction, description };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        throw new ConflictException("Duplicate referenceId for this account");
      throw error;
    }
  }

  async findAll(
    accountId: number,
    page: number,
    limit: number,
    type?: TransactionType
  ) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true },
    });
    if (!account) throw new NotFoundException("Account not found");
    const [items, total] = await this.prisma.$transaction([
      this.prisma.$queryRaw<
        Array<{
          id: number;
          accountId: number;
          type: TransactionType;
          amount: Prisma.Decimal;
          referenceId: string;
          description: string | null;
          createdAt: Date;
        }>
      >(Prisma.sql`
        SELECT t."id", t."accountId", t."type", t."amount", t."referenceId",
          to_jsonb(t)->>'description' AS "description", t."createdAt"
        FROM "Transaction" t
        WHERE t."accountId" = ${accountId}
        ${type ? Prisma.sql`AND t."type" = ${type}` : Prisma.empty}
        ORDER BY "createdAt" DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `),
      this.prisma.transaction.count({ where: { accountId, ...(type ? { type } : {}) } }),
    ]);
    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findRecent(page: number, limit: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.$queryRaw<
        Array<{
          id: number;
          accountId: number;
          accountName: string;
          type: TransactionType;
          amount: Prisma.Decimal;
          referenceId: string;
          description: string | null;
          createdAt: Date;
        }>
      >(Prisma.sql`
        SELECT t."id", t."accountId", a."name" AS "accountName", t."type",
          t."amount", t."referenceId", to_jsonb(t)->>'description' AS "description",
          t."createdAt"
        FROM "Transaction" t
        INNER JOIN "Account" a ON a."id" = t."accountId"
        ORDER BY t."createdAt" DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `),
      this.prisma.transaction.count(),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
