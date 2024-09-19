import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }

  async findAll(options: { page: number; limit: number }): Promise<{ data: User[]; total: number; page: number; lastPage: number }> {
    const [data, total] = await this.userRepository.findAndCount({
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page: options.page,
      lastPage: Math.ceil(total / options.limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  async verifyEmail(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isEmailVerified = true;
    return this.userRepository.save(user);
  }

  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<User> {
    const user = await this.findOne(id);
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      throw new ConflictException('Old password is incorrect');
    }
    user.password = newPassword;
    return this.userRepository.save(user);
  }
}