import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PresencesService } from './presences.service';
import { CreateSeanceDto, UpdateSeanceDto, MarquerPresenceDto, AppelGroupeDto } from './dto/presence.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('presences')
@ApiBearerAuth()
@Controller()
export class PresencesController {
  constructor(private presencesService: PresencesService) {}

  @Post('groupes/:groupeId/seances')
  createSeance(@Param('groupeId') groupeId: string, @Body() dto: CreateSeanceDto, @CurrentUser() user: any) {
    return this.presencesService.createSeance(groupeId, dto, user);
  }

  @Get('groupes/:groupeId/seances')
  findSeancesByGroupe(@Param('groupeId') groupeId: string, @CurrentUser() user: any) {
    return this.presencesService.findSeancesByGroupe(groupeId, user);
  }

  @Patch('seances/:seanceId')
  updateSeance(@Param('seanceId') seanceId: string, @Body() dto: UpdateSeanceDto, @CurrentUser() user: any) {
    return this.presencesService.updateSeance(seanceId, dto, user);
  }

  @Get('seances/:seanceId/presences')
  findPresencesBySeance(@Param('seanceId') seanceId: string, @CurrentUser() user: any) {
    return this.presencesService.findPresencesBySeance(seanceId, user);
  }

  @Patch('presences/:presenceId')
  marquerPresence(
    @Param('presenceId') presenceId: string,
    @Body() dto: MarquerPresenceDto,
    @CurrentUser() user: any,
  ) {
    return this.presencesService.marquerPresence(presenceId, dto, user);
  }

  @Post('seances/:seanceId/appel')
  appelGroupe(@Param('seanceId') seanceId: string, @Body() dto: AppelGroupeDto, @CurrentUser() user: any) {
    return this.presencesService.appelGroupe(seanceId, dto, user);
  }

  @Get('adherents/:adherentId/presences/stats')
  statsAdherent(@Param('adherentId') adherentId: string, @CurrentUser() user: any) {
    return this.presencesService.statsAdherent(adherentId, user);
  }
}