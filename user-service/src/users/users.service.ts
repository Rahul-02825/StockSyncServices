import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/auth/schemas.ts/user.schema';
import { WarehouseCreatedEvent, SupplierCreatedEvent } from './users.controller';

@Injectable()
export class UsersService {

    constructor(@InjectModel(User.name) private userModel:Model<UserDocument>){}

   handleWarehouseCreated = async(event:WarehouseCreatedEvent)=>{
    const warehouseAdmin = await this.userModel.findById(event.userId)
    if(!warehouseAdmin) throw new NotFoundException("user not found")

    // eliminates duplicate pushing of warehouses
    await this.userModel.findByIdAndUpdate(event.userId,
        {$addToSet:{warehouses:new Types.ObjectId(event.warehouseId)}},
        {new:true}
    )
    return {message:"updated the user model with warehouse id"}
   }

   handleSupplierCreated = async(event:SupplierCreatedEvent)=>{
    const user = await this.userModel.findById(event.userId)
    if(!user) throw new NotFoundException("user not found")

    await this.userModel.findByIdAndUpdate(event.userId,
        {$set:{supplierProfile:new Types.ObjectId(event.supplierProfileId)}},
        {new:true}
    )
    return {message:"updated the user model with supplier profile id"}
   }
}
