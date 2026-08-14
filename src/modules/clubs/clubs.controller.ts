import { Controller, Get, Post, Patch, Delete, Param, Body, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ClubsService } from './clubs.service';
import { CreateClubDto, JoinClubDto, UpdateMemberRoleDto, UpdateClubDto } from './dto/club.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

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

  @Patch(':clubId')
  updateInfo(
    @Param('clubId') clubId: string,
    @Body() dto: UpdateClubDto,
    @CurrentUser() user: any,
  ) {
    return this.clubsService.updateInfo(clubId, dto, user);
  }

  @Post('join')
  join(@Body() dto: JoinClubDto, @CurrentUser() user: any) {
    return this.clubsService.join(dto, user);
  }

  // ── Upload/changement du logo du club — réservé au staff ────────────────
  @Post(':clubId/logo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/clubs',
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          return cb(new BadRequestException('Format non autorisé (JPEG, PNG ou WebP uniquement)'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadLogo(
    @Param('clubId') clubId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu');
    }
    const logoUrl = `/uploads/clubs/${file.filename}`;
    return this.clubsService.updateLogo(clubId, logoUrl, user);
  }

  // ── Liste les membres du club — réservé au staff ─────────────────────────
  @Get(':clubId/members')
  getMembers(@Param('clubId') clubId: string, @CurrentUser() user: any) {
    return this.clubsService.getMembers(clubId, user);
  }

  // ── Change le rôle d'un membre — réservé à l'Admin ───────────────────────
  @Patch(':clubId/members/:userId/role')
  updateMemberRole(
    @Param('clubId') clubId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.clubsService.updateMemberRole(clubId, userId, dto.role, user);
  }

  // ── Retire un membre du club — réservé à l'Admin ─────────────────────────
  @Delete(':clubId/members/:userId')
  removeMember(
    @Param('clubId') clubId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    return this.clubsService.removeMember(clubId, userId, user);
  }
}