import { Module } from '@nestjs/common';
import { GroupesService } from './groupes.service';
import { GroupesController } from './groupes.controller';
import { ClubsModule } from '../clubs/clubs.module';

@Module({
  imports: [ClubsModule],
  controllers: [GroupesController],
  providers: [GroupesService],
  exports: [GroupesService],
})
export class GroupesModule {}