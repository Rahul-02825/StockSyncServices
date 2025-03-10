import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SuppliersModule } from './suppliers/suppliers.module';

@Module({
  imports: [SuppliersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
