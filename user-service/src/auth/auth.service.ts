import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './schemas.ts/user.schema';
import { UserDto } from './dto/user.dto';
import { loginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  register = async (userDto: UserDto) => {
    const { name, email, password, role } = userDto;
    // check existing user
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new UnauthorizedException('Email already exists!!');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      ...userDto,
      password: hashedPassword,
    });
    await newUser.save();
    return { message: 'user registered successfully' };
  };

  login = async (loginDto: loginDto) => {
    const { email, password } = loginDto;
    const checkUser = await this.userModel.findOne({ email });
    if (!checkUser) throw new UnauthorizedException('no such user !!');
    const passwordValid = await bcrypt.compare(password, checkUser.password);
    if (!passwordValid) throw new UnauthorizedException('incorrect password');

    // generate token
    const expiresIn = (this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h') as jwt.SignOptions['expiresIn'];
    const token = jwt.sign(
      { id: checkUser._id, email: checkUser.email, role: checkUser.role },
      this.configService.getOrThrow<string>('JWT_SECRET'),
      { expiresIn },
    );
    return { accessToken: token };
  };
}
