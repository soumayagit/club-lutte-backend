import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GroupesService } from './groupes.service';
import { CreateGroupeDto, UpdateGroupeDto, CreateCreneauDto } from './dto/groupe.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('groupes')
@ApiBearerAuth()
@Controller()
export class GroupesController {
  constructor(private groupesService: GroupesService) {}

  @Post('clubs/:clubId/groupes')
  create(@Param('clubId') clubId: string, @Body() dto: CreateGroupeDto, @CurrentUser() user: any) {
    return this.groupesService.create(clubId, dto, user);
  }

  @Get('clubs/:clubId/groupes')
  findByClub(@Param('clubId') clubId: string, @CurrentUser() user: any) {
    return this.groupesService.findByClub(clubId, user);
  }

  @Get('groupes/:groupeId')
  findOne(@Param('groupeId') groupeId: string, @CurrentUser() user: any) {
    return this.groupesService.findOne(groupeId, user);
  }

  @Patch('groupes/:groupeId')
  update(@Param('groupeId') groupeId: string, @Body() dto: UpdateGroupeDto, @CurrentUser() user: any) {
    return this.groupesService.update(groupeId, dto, user);
  }

  @Delete('groupes/:groupeId')
  remove(@Param('groupeId') groupeId: string, @CurrentUser() user: any) {
    return this.groupesService.remove(groupeId, user);
  }

  @Post('groupes/:groupeId/membres/:adherentId')
  addMembre(
    @Param('groupeId') groupeId: string,
    @Param('adherentId') adherentId: string,
    @CurrentUser() user: any,
  ) {
    return this.groupesService.addMembre(groupeId, adherentId, user);
  }

  @Delete('groupes/:groupeId/membres/:adherentId')
  removeMembre(
    @Param('groupeId') groupeId: string,
    @Param('adherentId') adherentId: string,
    @CurrentUser() user: any,
  ) {
    return this.groupesService.removeMembre(groupeId, adherentId, user);
  }

  @Post('groupes/:groupeId/entraineurs/:userId')
  addEntraineur(
    @Param('groupeId') groupeId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    return this.groupesService.addEntraineur(groupeId, userId, user);
  }

  @Post('groupes/:groupeId/creneaux')
  addCreneau(
    @Param('groupeId') groupeId: string,
    @Body() dto: CreateCreneauDto,
    @CurrentUser() user: any,
  ) {
    return this.groupesService.addCreneau(groupeId, dto, user);
  }

  @Delete('creneaux/:creneauId')
  removeCreneau(@Param('creneauId') creneauId: string, @CurrentUser() user: any) {
    return this.groupesService.removeCreneau(creneauId, user);
  }
}