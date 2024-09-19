import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

/**
 * AuthController
 * 
 * This controller handles user authentication operations including registration, login, and logout.
 * 
 * @class
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * Register a new user
     * 
     * @route POST /auth/register
     * @param {CreateUserDto} createUserDto - The user data for registration
     * @returns {Promise<any>} The registered user data
     * 
     * @apiresponse {201} User successfully registered
     * @apiresponse {400} Bad request - Validation error or user already exists
     */
    @Post('register')
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    /**
     * Authenticate a user and return a JWT token
     * 
     * @route POST /auth/login
     * @param {LoginDto} loginDto - The login credentials
     * @returns {Promise<{ access_token: string }>} JWT access token
     * 
     * @apiresponse {200} User successfully logged in
     * @apiresponse {401} Unauthorized - Invalid credentials
     * 
     * @security LocalAuthGuard
     */
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'User successfully logged in' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    /**
     * Log out the current user
     * 
     * @route POST /auth/logout
     * @param {Request} req - The request object containing the user
     * @returns {Promise<any>} Confirmation of logout
     * 
     * @apiresponse {200} User successfully logged out
     * @apiresponse {401} Unauthorized
     * 
     * @security JWT
     */
    @Post('logout')
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'User successfully logged out' })
    async logout(@Req() req) {
        return this.authService.logout(req.user);
    }
}