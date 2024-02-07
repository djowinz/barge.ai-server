import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/auth/public.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  async get(@Param('id') ID: string) {
    console.log(ID);
    return this.userService.get(ID);
  }

  @Post()
  @Public()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Put('/:id')
  async update(@Param('id') ID: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(ID, updateUserDto);
  }

  @Delete('/:id')
  async delete(@Param('id') ID: string) {
    return this.userService.deleteById(ID);
  }
}
