import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AccountsModule } from "./accounts/accounts.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { TransfersModule } from "./transfers/transfers.module";

@Module({
  imports: [PrismaModule, AccountsModule, TransactionsModule, TransfersModule],
})
export class AppModule {}
