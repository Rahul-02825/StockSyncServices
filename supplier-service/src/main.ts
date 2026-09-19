import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT ?? 8002;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(port);
  console.log(`🚀 Supplier Service HTTP API running on http://localhost:${port}`);
}
bootstrap();
