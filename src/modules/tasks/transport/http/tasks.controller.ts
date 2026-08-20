import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TASKS, type Tasks } from '../../index.js';
import { CreateTaskDto, TaskDto } from './task.dto.js';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(@Inject(TASKS) private readonly tasks: Tasks) {}

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiCreatedResponse({ type: TaskDto })
  create(@Body() command: CreateTaskDto) {
    return this.tasks.create(command);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks' })
  @ApiOkResponse({ type: TaskDto, isArray: true })
  list() {
    return this.tasks.list();
  }
}
