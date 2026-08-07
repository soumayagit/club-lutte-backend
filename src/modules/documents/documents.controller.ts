import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/document.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'];

@ApiTags('documents')
@ApiBearerAuth()
@Controller('adherents/:adherentId/documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          return cb(new BadRequestException('Format non autorisé (JPEG, PNG ou PDF uniquement)'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  upload(
    @Param('adherentId') adherentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu');
    }
    const fileUrl = `/uploads/documents/${file.filename}`;
    return this.documentsService.upload(adherentId, dto.type, fileUrl, dto.extractedData, user);
  }

  @Get()
  findByAdherent(@Param('adherentId') adherentId: string, @CurrentUser() user: any) {
    return this.documentsService.findByAdherent(adherentId, user);
  }

  @Patch(':documentId/status')
  @UseGuards(RolesGuard)
  @Roles('BUREAU', 'ADMIN', 'SECRETAIRE')
  updateStatus(
    @Param('documentId') documentId: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    return this.documentsService.updateStatus(documentId, status, user);
  }

  @Delete(':documentId')
  remove(@Param('documentId') documentId: string, @CurrentUser() user: any) {
    return this.documentsService.remove(documentId, user);
  }
}