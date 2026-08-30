import { Module } from '@nestjs/common';
import { PresencesService } from './presences.service';
import { PresencesController } from './presences.controller';
import { ClubsModule } from '../clubs/clubs.module';

@Module({
  imports: [ClubsModule],
  controllers: [PresencesController],
  providers: [PresencesService],
})
export class PresencesModule {}