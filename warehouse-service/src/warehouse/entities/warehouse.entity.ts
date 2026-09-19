import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';


export type WarehouseDocument = Warehouse & Document

@Schema({ timestamps: true }) // Adds createdAt and updatedAt fields
export class Warehouse extends Document {


  @Prop({type:MongooseSchema.Types.ObjectId, required:true})
  admin:Types.ObjectId

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId }] })
  suppliers: Types.ObjectId[];

  @Prop({
    type:[{
      supplierId:{type:MongooseSchema.Types.ObjectId},
      requestCapacity:Number,
      status:{type:String, enum:['PENDING','APPROVED','REJECTED'], default:'PENDING'}
    }],
    default:[]
  })
  requests:{_id:Types.ObjectId;supplierId:Types.ObjectId;requestCapacity:Number;status:string}[];

}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
