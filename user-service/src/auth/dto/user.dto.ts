import { IsDate, IsDateString, IsEmail,IsEnum,IsNotEmpty,IsString,MaxLength,MinLength , } from "class-validator";


export enum rolesEnum{
    SUPPLIER = "SUPPLIER",
    WARE_HOUSE_MANAGER = "WAREHOUSE_MANAGER",
    CUSTOMER = "CUSTOMER"
}
export class UserDto{
    @IsNotEmpty()
    name:string

    @IsEmail()
    email : string

    @IsString()
    @MinLength(8,{message:"password should be atleast 8 characters"})
    @MaxLength(20)
    password : string

    @IsEnum(rolesEnum,{message:"role should be suppler or customer"})
    role : rolesEnum

    // @Type(()=>Date)
//     @IsDate()
//     createdAt :Date
//     updatedAt :Date
}

