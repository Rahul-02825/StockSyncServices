import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true })
export class Supplier extends Document {
  // Same id as the User document in user-service (the JWT subject) — a
  // supplier profile is 1:1 with a SUPPLIER-role user, not a separate identity.
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  businessName: string;

  @Prop()
  contactEmail: string;

  @Prop()
  contactPhone: string;

  @Prop()
  address: string;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
