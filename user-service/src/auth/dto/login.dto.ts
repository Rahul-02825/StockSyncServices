import { IsDate,
     IsDateString,
      IsEmail,
      IsEnum,
      IsNotEmpty,
      IsString,
      MaxLength,
      MinLength , }
       from "class-validator";
import {rolesEnum} from './user.dto'

export class loginDto{

    @IsNotEmpty()
    name:string

    @IsEmail()
    email : string

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    password : string

     @IsEnum(rolesEnum,{message:"role should be customer or supplier"})
        role : rolesEnum
}
