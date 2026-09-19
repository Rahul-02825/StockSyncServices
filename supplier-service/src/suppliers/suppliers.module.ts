import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Supplier, SupplierSchema } from './entities/supplier.entity';
import { Product, ProductSchema } from './entities/product.entity';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
            queue: configService.getOrThrow<string>('USER_EVENTS_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'WAREHOUSE_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
            queue: configService.getOrThrow<string>('WAREHOUSE_EVENTS_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
