import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, TransactionType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransferDto } from "./dto/create-transfer.dto";

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransferDto) {
    if (dto.sourceAccountId === dto.destinationAccountId)
      throw new BadRequestException(
        "Source and destination accounts must differ"
      );
    if (new Prisma.Decimal(dto.amount).lessThanOrEqualTo(0))
      throw new BadRequestException("Amount must be greater than zero");
    const amount = new Prisma.Decimal(dto.amount);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const accounts = await tx.account.findMany({
          where: {
            id: { in: [dto.sourceAccountId, dto.destinationAccountId] },
          },
        });
        if (accounts.length !== 2)
          throw new NotFoundException("One or both accounts not found");
        const debit = await tx.account.updateMany({
          where: { id: dto.sourceAccountId, balance: { gte: amount } },
          data: { balance: { decrement: amount } },
        });
        if (debit.count !== 1)
          throw new BadRequestException("Insufficient balance");
        await tx.account.update({
          where: { id: dto.destinationAccountId },
          data: { balance: { increment: amount } },
        });
        await tx.transaction.create({
          data: {
            accountId: dto.sourceAccountId,
            type: TransactionType.debit,
            amount,
            referenceId: dto.referenceId,
          },
        });
        await tx.transaction.create({
          data: {
            accountId: dto.destinationAccountId,
            type: TransactionType.credit,
            amount,
            referenceId: dto.referenceId,
          },
        });
        return {
          message: "Transfer completed",
          sourceAccountId: dto.sourceAccountId,
          destinationAccountId: dto.destinationAccountId,
          amount: dto.amount,
          referenceId: dto.referenceId,
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        throw new ConflictException(
          "Duplicate referenceId for one of these accounts"
        );
      throw error;
    }
  }
}
