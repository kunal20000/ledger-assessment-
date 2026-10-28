import { ApiProperty } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class CreateTransferDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  sourceAccountId!: number;
  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  destinationAccountId!: number;
  @ApiProperty({ example: "30.00" })
  @Matches(/^\d+(\.\d{1,4})?$/, {
    message: "amount must be a positive decimal with up to 4 decimal places",
  })
  amount!: string;
  @ApiProperty({ example: "transfer-1001" })
  @Transform(({ value, obj }) => {
    const reference = value ?? obj.reference_id;
    return typeof reference === "string" ? reference.trim() : reference;
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  referenceId!: string;

  @ApiProperty({ name: "reference_id", example: "transfer-1001", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference_id?: string;
}
