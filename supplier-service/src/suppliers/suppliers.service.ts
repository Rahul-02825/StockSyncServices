import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Model, Types } from 'mongoose';
import { Supplier, SupplierDocument } from './entities/supplier.entity';
import { Product, ProductDocument } from './entities/product.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @Inject('WAREHOUSE_SERVICE') private readonly warehouseServiceClient: ClientProxy,
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async createSupplierProfile(userId: string, createSupplierDto: CreateSupplierDto) {
    const existing = await this.supplierModel.findOne({ userId });
    if (existing) throw new ConflictException('supplier profile already exists for this user');

    const supplier = new this.supplierModel({
      ...createSupplierDto,
      userId: new Types.ObjectId(userId),
    });
    await supplier.save();

    // Let user-service link this profile back onto the User document
    this.userServiceClient.emit('supplier-create', {
      supplierProfileId: supplier._id,
      userId,
    });

    return { message: 'supplier profile created successfully', data: supplier };
  }

  async getSupplierProfile(userId: string) {
    const supplier = await this.supplierModel.findOne({ userId });
    if (!supplier) throw new NotFoundException('supplier profile not found');
    return { message: 'success retrieved supplier profile', data: supplier };
  }

  async createProduct(supplierId: string, createProductDto: CreateProductDto) {
    const existing = await this.productModel.findOne({ supplierId, sku: createProductDto.sku });
    if (existing) throw new ConflictException('a product with this SKU already exists');

    const product = new this.productModel({
      ...createProductDto,
      supplierId: new Types.ObjectId(supplierId),
    });
    await product.save();

    this.emitStockUpdated(product);
    return { message: 'product created successfully', data: product };
  }

  async listProducts(supplierId: string) {
    const products = await this.productModel.find({ supplierId });
    return { message: 'success retrieved products', data: products };
  }

  async updateProductQuantity(supplierId: string, productId: string, quantity: number) {
    const product = await this.productModel.findOneAndUpdate(
      { _id: productId, supplierId },
      { $set: { quantity } },
      { new: true },
    );
    if (!product) throw new NotFoundException('product not found for this supplier');

    this.emitStockUpdated(product);
    return { message: 'product quantity updated successfully', data: product };
  }

  // Notifies every warehouse that has approved this supplier so their cached
  // stock levels stay in sync with the supplier's source-of-truth quantity.
  private emitStockUpdated(product: ProductDocument) {
    this.warehouseServiceClient.emit('stock-updated', {
      supplierId: product.supplierId.toString(),
      sku: product.sku,
      productName: product.name,
      quantity: product.quantity,
    });
  }
}
