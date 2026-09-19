import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Warehouse, WarehouseSchema } from './entities/warehouse.entity';
import { WarehouseStock, WarehouseStockSchema } from './entities/warehouse-stock.entity';

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
    ]),
    MongooseModule.forFeature([
      { name: Warehouse.name, schema: WarehouseSchema },
      { name: WarehouseStock.name, schema: WarehouseStockSchema },
    ]),
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService],
})
export class WarehouseModule {}
