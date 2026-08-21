import { Module } from '@nestjs/common';
import { CotisationsService } from './cotisations.service';
import { CotisationsController } from './cotisations.controller';
import { ClubsModule } from '../clubs/clubs.module';
import { TarifsModule } from '../tarifs/tarifs.module';

@Module({
  imports: [ClubsModule, TarifsModule],
  controllers: [CotisationsController],
  providers: [CotisationsService],
})
export class CotisationsModule {}