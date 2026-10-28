import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateTransferDto } from "./dto/create-transfer.dto";
import { TransfersService } from "./transfers.service";

@ApiTags("transfers")
@Controller("transfers")
export class TransfersController {
  constructor(private readonly service: TransfersService) {}
  @Post() create(@Body() dto: CreateTransferDto) {
    return this.service.create(dto);
  }
}
