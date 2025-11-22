import { PartialType } from '@nestjs/swagger';
import { CreateGoalDto } from './create-goal.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsPositive } from 'class-validator';

export class UpdateGoalDto extends PartialType(CreateGoalDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  accumulatedValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  accountId?: number;
}
