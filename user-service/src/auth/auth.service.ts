import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './schemas.ts/user.schema';
import { UserDto } from './dto/user.dto';
import { loginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
  private JWT_SECRET = 'SECRET_KEY';

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
    const { name, email, password } = loginDto;
    console.log(loginDto)
    const checkUser = await this.userModel.findOne({ email });
    if (!checkUser) throw new UnauthorizedException('no such user !!');
    const passwordValid = await bcrypt.compare(password, checkUser.password);
    if (!passwordValid) throw new UnauthorizedException('incorrect password');

    // generate token

    const token = jwt.sign(
      { id: checkUser._id, email: checkUser.email, role: checkUser.role },
      this.JWT_SECRET,
      { expiresIn: '1h' },
    );
    return { accessToken: token };
  };
}
