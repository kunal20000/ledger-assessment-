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
import { AccountsService } from "./accounts.service";
import { CreateAccountDto } from "./dto/create-account.dto";

@ApiTags("accounts")
@Controller("accounts")
export class AccountsController {
  constructor(private readonly service: AccountsService) {}
  @Post() create(@Body() dto: CreateAccountDto) {
    return this.service.create(dto);
  }
  @Get() findAll(@Query("page") page = "1", @Query("limit") limit = "10") {
    const p = Number(page);
    const l = Number(limit);
    if (
      !Number.isInteger(p) ||
      p < 1 ||
      !Number.isInteger(l) ||
      l < 1 ||
      l > 100
    )
      throw new BadRequestException("Invalid pagination parameters");
    return this.service.findAll(p, l);
  }
  @Get(":id/balance")
  getBalance(@Param("id", ParseIntPipe) id: number) {
    return this.service.getBalance(id);
  }

  @Get(":id") findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
