import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TarifsService } from './tarifs.service';
import { SetTarifDto, CreateCodePromoDto, UpdateCodePromoDto } from './dto/tarif.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tarifs')
@ApiBearerAuth()
@Controller('clubs/:clubId')
export class TarifsController {
  constructor(private tarifsService: TarifsService) {}

  // ── Tarifs ────────────────────────────────────────────────────────────
  @Post('tarifs')
  setTarif(@Param('clubId') clubId: string, @Body() dto: SetTarifDto, @CurrentUser() user: any) {
    return this.tarifsService.setTarif(clubId, dto, user);
  }

  @Get('tarifs')
  @ApiQuery({ name: 'saison', example: '2025-2026' })
  findTarifs(@Param('clubId') clubId: string, @Query('saison') saison: string, @CurrentUser() user: any) {
    return this.tarifsService.findTarifs(clubId, saison, user);
  }

  @Delete('tarifs/:tarifId')
  deleteTarif(@Param('tarifId') tarifId: string, @CurrentUser() user: any) {
    return this.tarifsService.deleteTarif(tarifId, user);
  }

  // ── Codes promo ───────────────────────────────────────────────────────
  @Post('codes-promo')
  createCodePromo(@Param('clubId') clubId: string, @Body() dto: CreateCodePromoDto, @CurrentUser() user: any) {
    return this.tarifsService.createCodePromo(clubId, dto, user);
  }

  @Get('codes-promo')
  findCodesPromo(@Param('clubId') clubId: string, @CurrentUser() user: any) {
    return this.tarifsService.findCodesPromo(clubId, user);
  }

  @Patch('codes-promo/:codePromoId')
  updateCodePromo(
    @Param('codePromoId') codePromoId: string,
    @Body() dto: UpdateCodePromoDto,
    @CurrentUser() user: any,
  ) {
    return this.tarifsService.updateCodePromo(codePromoId, dto, user);
  }

  // ── Simule le calcul d'un montant sans créer de cotisation (utile pour
  // afficher un aperçu du prix avant validation, côté app) ────────────────
  @Get('tarifs/simulate/:adherentId')
  @ApiQuery({ name: 'saison', example: '2025-2026' })
  @ApiQuery({ name: 'codePromo', required: false, example: 'FAMILLE2026' })
  simulate(
    @Param('clubId') clubId: string,
    @Param('adherentId') adherentId: string,
    @Query('saison') saison: string,
    @Query('codePromo') codePromo: string,
    @CurrentUser() user: any,
  ) {
    return this.tarifsService.calculerMontant({ clubId, saison, adherentId, codePromo });
  }
}