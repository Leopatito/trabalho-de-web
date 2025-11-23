import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';
import { IsBoolean, IsDefined } from 'class-validator';
import { Optional } from '@nestjs/common';
import { IsString, IsOptional, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @ApiProperty({
    required: false,
    type: Boolean,
    description: 'Indicates if the account is active or not',
  })
  @IsDefined()
  @IsBoolean()
  @Optional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Icon of the account',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;
}
