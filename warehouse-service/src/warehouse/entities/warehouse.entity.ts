import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


export type WarehouseDocument = Warehouse & Document

@Schema({ timestamps: true }) // Adds createdAt and updatedAt fields
export class Warehouse extends Document {
    
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ type: [{ type: Types.ObjectId }] })
  suppliers: Types.ObjectId[];
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
