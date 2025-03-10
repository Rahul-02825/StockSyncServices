import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'], // RabbitMQ connection URL
      queue: 'warehouse_queue', // Name of the queue
      queueOptions: {
        durable: true, // Non-durable queue
      },
    },
  });

  await app.listen();
  console.log('✅ WarehouseService is listening for RabbitMQ messages...');
}

bootstrap();
