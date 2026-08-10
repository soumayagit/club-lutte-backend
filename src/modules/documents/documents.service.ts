import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubsService } from '../clubs/clubs.service';

interface CurrentUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private clubsService: ClubsService,
  ) {}

  // ── Vérifie l'accès à l'adhérent concerné, via le rôle dans SON club ────────
  private async assertAccessToAdherent(adherentId: string, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id: adherentId } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }

    const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);

    if (STAFF_ROLES.includes(roleInClub)) return adherent;
    if (roleInClub === 'TUTEUR' && adherent.tuteurId === currentUser.id) return adherent;
    if (roleInClub === 'ADHERENT' && adherent.userId === currentUser.id) return adherent;
    throw new ForbiddenException('Accès refusé à cette fiche adhérent');
  }

  async upload(
    adherentId: string,
    type: string,
    fileUrl: string,
    extractedData: string | undefined,
    currentUser: CurrentUser,
  ) {
    await this.assertAccessToAdherent(adherentId, currentUser);

    let parsedData: any = null;
    if (extractedData) {
      try {
        parsedData = JSON.parse(extractedData);
      } catch {
        parsedData = null;
      }
    }

    return this.prisma.document.create({
      data: {
        adherentId,
        type,
        fileUrl,
        extractedData: parsedData,
        status: 'PENDING',
      },
    });
  }

  async findByAdherent(adherentId: string, currentUser: CurrentUser) {
    await this.assertAccessToAdherent(adherentId, currentUser);
    return this.prisma.document.findMany({
      where: { adherentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(documentId: string, status: string, currentUser: CurrentUser) {
    const document = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      throw new NotFoundException('Document introuvable');
    }

    const adherent = await this.prisma.adherent.findUnique({ where: { id: document.adherentId } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }

    const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
    if (!STAFF_ROLES.includes(roleInClub)) {
      throw new ForbiddenException('Seul le bureau peut valider/refuser un document');
    }

    return this.prisma.document.update({ where: { id: documentId }, data: { status } });
  }

  async remove(documentId: string, currentUser: CurrentUser) {
    const document = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      throw new NotFoundException('Document introuvable');
    }
    await this.assertAccessToAdherent(document.adherentId, currentUser);
    return this.prisma.document.delete({ where: { id: documentId } });
  }
}