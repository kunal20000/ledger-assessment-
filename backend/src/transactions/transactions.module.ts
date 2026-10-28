import { Module } from "@nestjs/common";
import { RecentTransactionsController, TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";

@Module({
  controllers: [TransactionsController, RecentTransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
