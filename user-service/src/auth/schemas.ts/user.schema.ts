import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema, Types } from 'mongoose'
export type UserDocument = User & Document


import {rolesEnum} from '../dto/user.dto'
@Schema({ timestamps: true })
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
        type:[{type:MongooseSchema.Types.ObjectId}]
    })
    warehouses:Types.ObjectId[]

    @Prop({
        type:MongooseSchema.Types.ObjectId
    })
    supplierProfile:Types.ObjectId

}
export const UserSchema = SchemaFactory.createForClass(User);
