import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type WarehouseStockDocument = WarehouseStock & Document;

// Read-model that mirrors a supplier's product quantity for every warehouse
// that has approved that supplier's capacity request. Kept in sync via the
// 'stock-updated' event emitted by supplier-service whenever a product's
// quantity changes.
@Schema({ timestamps: true })
export class WarehouseStock extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  warehouseId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  supplierId: Types.ObjectId;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, default: 0 })
  quantity: number;
}

export const WarehouseStockSchema = SchemaFactory.createForClass(WarehouseStock);
WarehouseStockSchema.index({ warehouseId: 1, supplierId: 1, sku: 1 }, { unique: true });
