import { Module } from '@nestjs/common';
import { DeplacementsService } from './deplacements.service';
import { DeplacementsController } from './deplacements.controller';
import { ClubsModule } from '../clubs/clubs.module';

@Module({
  imports: [ClubsModule],
  controllers: [DeplacementsController],
  providers: [DeplacementsService],
})
export class DeplacementsModule {}