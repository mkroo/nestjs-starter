import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ type: String, example: 'Ship the starter', maxLength: 200 })
  @IsString()
  @Length(1, 200)
  title!: string;
}

export class TaskDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ type: String, example: 'Ship the starter' })
  title!: string;

  @ApiProperty({ type: Boolean, example: false })
  completed!: boolean;

  @ApiProperty({ type: Date, format: 'date-time' })
  createdAt!: Date;
}
