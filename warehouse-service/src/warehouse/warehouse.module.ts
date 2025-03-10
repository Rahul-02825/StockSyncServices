import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { Warehouse, WarehouseSchema } from './entities/warehouse.entity';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'WAREHOUSE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'warehouse_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
    MongooseModule.forFeature([{ name: Warehouse.name, schema: WarehouseSchema }])
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService],
})
export class WarehouseModule {}
