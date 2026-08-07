import { Module } from '@nestjs/common';
import { AdherentsService } from './adherents.service';
import { AdherentsController } from './adherents.controller';

@Module({
  controllers: [AdherentsController],
  providers: [AdherentsService],
  exports: [AdherentsService],
})
export class AdherentsModule {}