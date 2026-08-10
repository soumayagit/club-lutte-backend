import { Module } from '@nestjs/common';
import { AdherentsService } from './adherents.service';
import { AdherentsController } from './adherents.controller';
import { ClubsModule } from '../clubs/clubs.module';

@Module({
  imports: [ClubsModule],
  controllers: [AdherentsController],
  providers: [AdherentsService],
  exports: [AdherentsService],
})
export class AdherentsModule {}