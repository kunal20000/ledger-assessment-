import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export enum TransactionTypeDto {
  credit = "credit",
  debit = "debit",
}

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionTypeDto })
  @IsEnum(TransactionTypeDto)
  type!: TransactionTypeDto;

  @ApiProperty({ example: "25.00", description: "Positive decimal amount" })
  @Matches(/^\d+(\.\d{1,4})?$/, {
    message: "amount must be a positive decimal with up to 4 decimal places",
  })
  amount!: string;

  @ApiProperty({ example: "invoice-1001" })
  @Transform(({ value, obj }) => {
    const reference = value ?? obj.reference_id;
    return typeof reference === "string" ? reference.trim() : reference;
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  referenceId!: string;

  // Accept the assessment's snake_case field name as an API alias.
  @ApiProperty({ name: "reference_id", example: "invoice-1001", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference_id?: string;

  @ApiProperty({ example: "Customer invoice payment", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
