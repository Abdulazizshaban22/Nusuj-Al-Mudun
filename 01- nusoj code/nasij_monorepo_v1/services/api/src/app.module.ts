import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FabricController } from './fabric.controller';

@Module({
  controllers: [AppController, FabricController],
  providers: [],
})
export class AppModule {}
