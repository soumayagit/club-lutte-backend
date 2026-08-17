import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CotisationsService } from './cotisations.service';
import { CreateCotisationDto, UpdateCotisationDto } from './dto/cotisation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('cotisations')
@ApiBearerAuth()
@Controller()
export class CotisationsController {
  constructor(private cotisationsService: CotisationsService) {}

  @Post('adherents/:adherentId/cotisations')
  create(
    @Param('adherentId') adherentId: string,
    @Body() dto: CreateCotisationDto,
    @CurrentUser() user: any,
  ) {
    return this.cotisationsService.create(adherentId, dto, user);
  }

  @Get('clubs/:clubId/cotisations')
  @ApiQuery({ name: 'saison', example: '2025-2026' })
  findByClub(
    @Param('clubId') clubId: string,
    @Query('saison') saison: string,
    @CurrentUser() user: any,
  ) {
    return this.cotisationsService.findByClub(clubId, saison, user);
  }

  @Patch('cotisations/:cotisationId')
  update(
    @Param('cotisationId') cotisationId: string,
    @Body() dto: UpdateCotisationDto,
    @CurrentUser() user: any,
  ) {
    return this.cotisationsService.update(cotisationId, dto, user);
  }

  @Post('clubs/:clubId/cotisations/generate')
  generateForClub(
    @Param('clubId') clubId: string,
    @Body('saison') saison: string,
    @Body('montant') montant: number,
    @CurrentUser() user: any,
  ) {
    return this.cotisationsService.generateForClub(clubId, saison, montant, user);
  }
}