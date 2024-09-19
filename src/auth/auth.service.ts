import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }

    async register(createUserDto: CreateUserDto) {
        try {
            const existingUser = await this.usersService.findByEmail(createUserDto.email);
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }

            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const newUser = await this.usersService.create({
                ...createUserDto,
                password: hashedPassword,
            });

            const { password, ...result } = newUser;
            return result;
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Something went wrong');
        }
    }

    async logout(user: User) {
        // Implement logout logic here (e.g., invalidate token, clear session)
        return { message: 'Logout successful' };
    }
}
