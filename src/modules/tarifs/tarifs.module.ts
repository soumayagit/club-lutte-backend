import { Module } from '@nestjs/common';
import { TarifsService } from './tarifs.service';
import { TarifsController } from './tarifs.controller';
import { ClubsModule } from '../clubs/clubs.module';

@Module({
  imports: [ClubsModule],
  controllers: [TarifsController],
  providers: [TarifsService],
  exports: [TarifsService],
})
export class TarifsModule {}