import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { TransactionsService } from "./transactions.service";
import { TransactionType } from "@prisma/client";

function pagination(page: string, limit: string) {
  const p = Number(page),
    l = Number(limit);
  if (!Number.isInteger(p) || p < 1 || !Number.isInteger(l) || l < 1 || l > 100)
    throw new BadRequestException("Invalid pagination parameters");
  return [p, l] as const;
}

@ApiTags("transactions")
@Controller("accounts/:accountId/transactions")
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}
  @Post() create(
    @Param("accountId", ParseIntPipe) id: number,
    @Body() dto: CreateTransactionDto
  ) {
    return this.service.create(id, dto);
  }
  @Get() findAll(
    @Param("accountId", ParseIntPipe) id: number,
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("type") type?: string
  ) {
    const [p, l] = pagination(page, limit);
    if (type && !Object.values(TransactionType).includes(type as TransactionType)) {
      throw new BadRequestException("type must be either credit or debit");
    }
    return this.service.findAll(id, p, l, type as TransactionType | undefined);
  }
}

@ApiTags("transactions")
@Controller("transactions")
export class RecentTransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get("recent")
  findRecent(@Query("page") page = "1", @Query("limit") limit = "20") {
    const [p, l] = pagination(page, limit);
    return this.service.findRecent(p, l);
  }
}
