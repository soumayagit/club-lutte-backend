import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubsService } from '../clubs/clubs.service';
import { CreateCotisationDto, UpdateCotisationDto } from './dto/cotisation.dto';

interface CurrentUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];

@Injectable()
export class CotisationsService {
  constructor(
    private prisma: PrismaService,
    private clubsService: ClubsService,
  ) {}

  private async assertStaffAccess(adherentId: string, currentUser: CurrentUser): Promise<string> {
    const adherent = await this.prisma.adherent.findUnique({ where: { id: adherentId } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    const role = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException('Seul le staff du club peut gérer les cotisations');
    }
    return adherent.clubId;
  }

  async create(adherentId: string, dto: CreateCotisationDto, currentUser: CurrentUser) {
    await this.assertStaffAccess(adherentId, currentUser);

    const existing = await this.prisma.cotisation.findUnique({
      where: { adherentId_saison: { adherentId, saison: dto.saison } },
    });
    if (existing) {
      throw new ConflictException('Une cotisation existe déjà pour cette saison');
    }

    return this.prisma.cotisation.create({
      data: {
        adherentId,
        saison: dto.saison,
        montant: dto.montant,
        statut: 'IMPAYE',
        echeance: dto.echeance ? new Date(dto.echeance) : undefined,
      },
    });
  }

  async findByClub(clubId: string, saison: string, currentUser: CurrentUser) {
    const role = await this.clubsService.getRoleInClub(clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException('Seul le staff du club peut voir les cotisations');
    }

    const cotisations = await this.prisma.cotisation.findMany({
      where: { saison, adherent: { clubId } },
      include: { adherent: true },
      orderBy: { adherent: { lastName: 'asc' } },
    });

    return cotisations.map((c) => ({
      id: c.id,
      adherentId: c.adherentId,
      adherentNom: `${c.adherent.firstName} ${c.adherent.lastName}`,
      saison: c.saison,
      montant: c.montant,
      statut: c.statut,
      echeance: c.echeance,
      datePaiement: c.datePaiement,
      moyenPaiement: c.moyenPaiement,
      prestataire: c.prestataire,
      recuUrl: c.recuUrl,
    }));
  }

  async update(cotisationId: string, dto: UpdateCotisationDto, currentUser: CurrentUser) {
    const cotisation = await this.prisma.cotisation.findUnique({ where: { id: cotisationId } });
    if (!cotisation) {
      throw new NotFoundException('Cotisation introuvable');
    }
    await this.assertStaffAccess(cotisation.adherentId, currentUser);

    return this.prisma.cotisation.update({
      where: { id: cotisationId },
      data: {
        ...(dto.statut !== undefined && { statut: dto.statut }),
        ...(dto.montant !== undefined && { montant: dto.montant }),
        ...(dto.moyenPaiement !== undefined && { moyenPaiement: dto.moyenPaiement }),
        ...(dto.prestataire !== undefined && { prestataire: dto.prestataire }),
        ...(dto.echeance !== undefined && { echeance: new Date(dto.echeance) }),
        ...(dto.statut === 'PAYE' && { datePaiement: new Date() }),
      },
    });
  }

  async generateForClub(clubId: string, saison: string, montant: number, currentUser: CurrentUser, echeance?: string) {
    const role = await this.clubsService.getRoleInClub(clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException('Seul le staff du club peut générer les cotisations');
    }

    const adherents = await this.prisma.adherent.findMany({
      where: { clubId, status: 'VALIDATED' },
    });

    let created = 0;
    for (const a of adherents) {
      const existing = await this.prisma.cotisation.findUnique({
        where: { adherentId_saison: { adherentId: a.id, saison } },
      });
      if (!existing) {
        await this.prisma.cotisation.create({
          data: {
            adherentId: a.id,
            saison,
            montant,
            statut: 'IMPAYE',
            echeance: echeance ? new Date(echeance) : undefined,
          },
        });
        created++;
      }
    }

    return { created, total: adherents.length };
  }
}