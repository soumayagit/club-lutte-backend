import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdherentsService } from './adherents.service';
import { CreateAdherentDto, UpdateAdherentDto, UpdateStatusDto, DraftAdherentDto } from './dto/adherent.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('adherents')
@ApiBearerAuth()
@Controller('clubs/:clubId/adherents')
export class AdherentsController {
  constructor(private adherentsService: AdherentsService) {}

  @Post()
  create(@Param('clubId') clubId: string, @Body() dto: CreateAdherentDto, @CurrentUser() user: any) {
    return this.adherentsService.create(clubId, dto, user);
  }

  @Post('draft')
  createDraft(@Param('clubId') clubId: string, @Body() dto: DraftAdherentDto, @CurrentUser() user: any) {
    return this.adherentsService.createDraft(clubId, dto, user);
  }

  @Patch(':id/draft')
  saveDraft(@Param('id') id: string, @Body() dto: DraftAdherentDto, @CurrentUser() user: any) {
    return this.adherentsService.saveDraft(id, dto, user);
  }

  @Get()
  findAll(@Param('clubId') clubId: string, @CurrentUser() user: any) {
    return this.adherentsService.findAll(clubId, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adherentsService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdherentDto, @CurrentUser() user: any) {
    return this.adherentsService.update(id, dto, user);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: any) {
    return this.adherentsService.updateStatus(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adherentsService.remove(id, user);
  }
}