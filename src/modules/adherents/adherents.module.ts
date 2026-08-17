import { Module } from '@nestjs/common';
import { AdherentsService } from './adherents.service';
import { AdherentsController } from './adherents.controller';
import { ClubsModule } from '../clubs/clubs.module';
import { CotisationsModule } from '../cotisations/cotisations.module';

@Module({
  imports: [ClubsModule,CotisationsModule],
  controllers: [AdherentsController],
  providers: [AdherentsService],
  exports: [AdherentsService],
  
})
export class AdherentsModule {}