import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import {AuthService} from './auth.service'
import { get } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { loginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService:AuthService ){}   
    @Post('register')
    @UsePipes(new ValidationPipe())
    async register (@Body() userDto:UserDto){
        return this.authService.register(userDto)
    }   

    @Post('login')  
    async login(@Body() loginDto:loginDto){
        return this.authService.login(loginDto)
    }
}
