import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WarehouseModule } from './warehouse/warehouse.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot("mongodb+srv://rahul:Rahul28@cluster0.ytu98.mongodb.net/StockSync?retryWrites=true&w=majority&appName=Cluster0", {
  }),WarehouseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
