import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // 🚀 Start the HTTP API server
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(8001); // Change port if needed
  console.log('🚀 Warehouse Service HTTP API running on http://localhost:8001');

  // 📡 Start the RabbitMQ microservice listener
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'], // Change if using a remote RabbitMQ
      queue: 'warehouse_queue', // Name of the queue
      queueOptions: { durable: true },
    },
  });

  await microservice.listen();
  console.log('📡 warehouse Service is listening for RabbitMQ events...');
}

bootstrap();
