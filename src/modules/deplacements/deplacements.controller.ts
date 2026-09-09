import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DeplacementsService } from './deplacements.service';
import {
  CreateDeplacementDto,
  UpdateDeplacementDto,
  AddParticipantsDto,
  ProposerVehiculeDto,
  AffecterPassagerDto,
  ValiderAutorisationDto,
} from './dto/deplacement.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('deplacements')
@ApiBearerAuth()
@Controller()
export class DeplacementsController {
  constructor(private deplacementsService: DeplacementsService) {}

  @Post('clubs/:clubId/deplacements')
  create(@Param('clubId') clubId: string, @Body() dto: CreateDeplacementDto, @CurrentUser() user: any) {
    return this.deplacementsService.create(clubId, dto, user);
  }

  @Get('clubs/:clubId/deplacements')
  findByClub(@Param('clubId') clubId: string, @CurrentUser() user: any) {
    return this.deplacementsService.findByClub(clubId, user);
  }

  @Get('deplacements/:deplacementId/participants')
  findParticipants(@Param('deplacementId') deplacementId: string, @CurrentUser() user: any) {
    return this.deplacementsService.findParticipants(deplacementId, user);
  }

  @Patch('deplacements/:deplacementId')
  update(@Param('deplacementId') deplacementId: string, @Body() dto: UpdateDeplacementDto, @CurrentUser() user: any) {
    return this.deplacementsService.update(deplacementId, dto, user);
  }

  @Post('deplacements/:deplacementId/participants')
  addParticipants(
    @Param('deplacementId') deplacementId: string,
    @Body() dto: AddParticipantsDto,
    @CurrentUser() user: any,
  ) {
    return this.deplacementsService.addParticipants(deplacementId, dto, user);
  }

  @Post('deplacements/:deplacementId/vehicules')
  proposerVehicule(
    @Param('deplacementId') deplacementId: string,
    @Body() dto: ProposerVehiculeDto,
    @CurrentUser() user: any,
  ) {
    return this.deplacementsService.proposerVehicule(deplacementId, dto, user);
  }

  @Get('deplacements/:deplacementId/vehicules')
  findVehicules(@Param('deplacementId') deplacementId: string, @CurrentUser() user: any) {
    return this.deplacementsService.findVehicules(deplacementId, user);
  }

  @Post('vehicules/:vehiculeId/passagers')
  affecterPassager(
    @Param('vehiculeId') vehiculeId: string,
    @Body() dto: AffecterPassagerDto,
    @CurrentUser() user: any,
  ) {
    return this.deplacementsService.affecterPassager(vehiculeId, dto, user);
  }

  @Delete('passagers/:passagerId')
  retirerPassager(@Param('passagerId') passagerId: string, @CurrentUser() user: any) {
    return this.deplacementsService.retirerPassager(passagerId, user);
  }

  @Patch('passagers/:passagerId/autorisation')
  validerAutorisation(
    @Param('passagerId') passagerId: string,
    @Body() dto: ValiderAutorisationDto,
    @CurrentUser() user: any,
  ) {
    return this.deplacementsService.validerAutorisation(passagerId, dto, user);
  }

  @Post('deplacements/:deplacementId/valider-transport')
  validerPlanTransport(@Param('deplacementId') deplacementId: string, @CurrentUser() user: any) {
    return this.deplacementsService.validerPlanTransport(deplacementId, user);
  }
}