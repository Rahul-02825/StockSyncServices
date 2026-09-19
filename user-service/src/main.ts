import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const port = process.env.PORT ?? 8000;

  // 🚀 Start the HTTP API server
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(port);
  console.log(`🚀 user Service HTTP API running on http://localhost:${port}`);

  // 📡 Start the RabbitMQ microservice listener
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
      queue: process.env.USER_EVENTS_QUEUE ?? 'user_events_queue',
      queueOptions: { durable: true },
    },
  });

  await microservice.listen();
  console.log('📡 User Service is listening for RabbitMQ events...');
}

bootstrap();
