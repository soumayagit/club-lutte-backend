import { Module } from '@nestjs/common';
import { CotisationsService } from './cotisations.service';
import { CotisationsController } from './cotisations.controller';
import { ClubsModule } from '../clubs/clubs.module';

@Module({
  imports: [ClubsModule],
  controllers: [CotisationsController],
  providers: [CotisationsService],
})
export class CotisationsModule {}