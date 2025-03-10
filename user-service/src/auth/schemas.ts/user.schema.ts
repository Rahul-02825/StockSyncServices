import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose'
import { Document } from 'mongoose'
export type UserDocument = User & Document


import {rolesEnum} from '../dto/user.dto'
@Schema()
export class User{
    @Prop({required:true})
    name:string

    @Prop({required:true})
    email:string

    @Prop({required:true})
    password:string

    @Prop({
        required:true,
        enum:rolesEnum
    })
    role : rolesEnum

    @Prop({
        type:Date,
        default:Date.now()
    })
    createdAt:Date

    @Prop({
        type:Date,
        defualt:Date.now()
    })
    UpdatedAt :Date
}
export const UserSchema = SchemaFactory.createForClass(User);
