import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClubsService } from './clubs.service';
import { CreateClubDto, JoinClubDto } from './dto/club.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('clubs')
@ApiBearerAuth()
@Controller('clubs')
export class ClubsController {
  constructor(private clubsService: ClubsService) {}

  @Post()
  create(@Body() dto: CreateClubDto, @CurrentUser() user: any) {
    return this.clubsService.create(dto, user);
  }

  @Get('mine')
  findMine(@CurrentUser() user: any) {
    return this.clubsService.findMine(user);
  }

  @Get(':clubId')
  findOne(@Param('clubId') clubId: string, @CurrentUser() user: any) {
    return this.clubsService.findOne(clubId, user);
  }

  @Post('join')
  join(@Body() dto: JoinClubDto, @CurrentUser() user: any) {
    return this.clubsService.join(dto, user);
  }
}