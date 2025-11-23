import { PartialType } from '@nestjs/swagger';
import { CreateGoalDto } from './create-goal.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsPositive, Min } from 'class-validator';

export class UpdateGoalDto extends PartialType(CreateGoalDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  accumulatedValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  accountId?: number;
}
