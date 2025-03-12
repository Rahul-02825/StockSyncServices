import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/auth/schemas.ts/user.schema';
import { CreateWarehouseDto } from './dto/data.dto';
import { QueueDto } from './users.controller';

@Injectable()
export class UsersService {

    constructor(@InjectModel(User.name) private userModel:Model<UserDocument>){}
    
   handleWarehouseCreated = async(queueData:QueueDto)=>{
    const warehouseAdmin = await this.userModel.findById(queueData.userId)

    // check if warehouse admin is awailable in db
    if(!warehouseAdmin) throw new NotFoundException("Supplier not found")

    // eliminates duplicate pushing of warehouses
    await this.userModel.findByIdAndUpdate(queueData.userId,
        {$addToSet:{warehouses:new Types.ObjectId(queueData.warehouseId)}},
        {new:true}
    )
    return {message:"updated the user model with warehouse id"}
   }
}
