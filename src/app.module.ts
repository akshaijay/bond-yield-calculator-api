import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BondController } from './bond/bond.controller';
import { BondService } from './bond/bond.service';

@Module({
  imports: [],
  controllers: [AppController, BondController],
  providers: [AppService, BondService],
})
export class AppModule {}
