import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product extends Document {
  // The supplier's User._id — kept consistent with warehouse-service's
  // requests[].supplierId so stock-sync events line up by the same id.
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  supplierId: Types.ObjectId;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 0 })
  unitPrice: number;

  @Prop({ required: true, default: 0 })
  quantity: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ supplierId: 1, sku: 1 }, { unique: true });
