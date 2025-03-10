import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/auth/schemas.ts/user.schema';
import { CreateWarehouseDto } from './dto/data.dto';

@Injectable()
export class UsersService {

    // constructor(@InjectModel(User.name) private userModel:Model<UserDocument>){}
    
    // createWarehouse = async(createWarehouseDto:CreateWarehouseDto)=>{
    //     // const {name,location,capacity} = createWarehouseDto
    //     const newWarehouse = new this.userModel({...createWarehouseDto,})  
    //     newWarehouse.save()
    //     return {message:"Warehouse created Successfully"}
    // }
}
