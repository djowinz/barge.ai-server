import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import * as error_codes from 'src/utils/error_codes';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async get(ID: string): Promise<User> {
    const user = await this.userModel
      .findOne({ id: ID })
      .select('-password -__v -_id')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${ID} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hash = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hash;
    const createdUser = new this.userModel(createUserDto);
    try {
      const saveOp = await createdUser.save();
      return this.get(saveOp.id);
    } catch (e) {
      switch (e.code) {
        case 11000:
          throw new HttpException('User with email already exists', 400);
        default:
          throw new InternalServerErrorException(
            'Internal server error: contact support: ' +
              error_codes.default.UNABLE_TO_SAVE_VIOLATION,
          );
      }
    }
  }

  async update(ID: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      const hash = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.password = hash;
    }
    return this.userModel.findOneAndUpdate({ id: ID }, updateUserDto, {
      new: true,
    });
  }

  async deleteById(ID: string): Promise<null> {
    const user = await this.userModel.findOne({ id: ID }).exec();
    console.log(user);
    if (!user) {
      throw new NotFoundException(`User with ID ${ID} not found`);
    }
    this.userModel.deleteOne({ id: ID }).exec();
    return null;
  }

  async findByEmail(username: string): Promise<User> {
    const user = await this.userModel
      .findOne({ username })
      .select('-_id -__v')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with email ${username} not found`);
    }
    return user;
  }
}
