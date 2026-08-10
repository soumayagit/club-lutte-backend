import { Injectable, ForbiddenException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubsService } from '../clubs/clubs.service';
import { CreateAdherentDto, UpdateAdherentDto, UpdateStatusDto, DraftAdherentDto } from './dto/adherent.dto';

interface CurrentUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];

@Injectable()
export class AdherentsService {
  constructor(
    private prisma: PrismaService,
    private clubsService: ClubsService,
  ) {}

  private computeIsMinor(birthDate: Date): boolean {
    const age = (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age < 18;
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[] | undefined) ?? [];
        if (target.includes('licenceFFLDA')) {
          throw new ConflictException('Ce numéro de licence FFLDA est déjà utilisé dans ce club');
        }
        throw new ConflictException('Une valeur unique est déjà utilisée par un autre enregistrement');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Adhérent introuvable');
      }
    }
    throw error;
  }

  // ── Toutes les méthodes prennent maintenant clubId + vérifient le rôle DANS ce club ──

  async create(clubId: string, dto: CreateAdherentDto, currentUser: CurrentUser) {
    const roleInClub = await this.clubsService.getRoleInClub(clubId, currentUser);
    const birthDate = new Date(dto.birthDate);
    const isMinor = this.computeIsMinor(birthDate);

    let userId: string | undefined;
    let tuteurId: string | undefined;

    if (STAFF_ROLES.includes(roleInClub)) {
      tuteurId = dto.tuteurId;
    } else if (roleInClub === 'TUTEUR') {
      if (!isMinor) {
        throw new BadRequestException('Un tuteur ne peut créer que des fiches d\'adhérents mineurs');
      }
      tuteurId = currentUser.id;
    } else if (roleInClub === 'ADHERENT') {
      if (isMinor) {
        throw new BadRequestException('Un compte adhérent majeur ne peut pas créer de fiche mineure — un tuteur doit s\'en charger');
      }
      // Un même compte peut être adhérent dans PLUSIEURS clubs différents,
      // donc on vérifie l'unicité seulement DANS ce club précis.
      const existing = await this.prisma.adherent.findFirst({
        where: { userId: currentUser.id, clubId },
      });
      if (existing) {
        throw new BadRequestException('Une fiche adhérent existe déjà pour ce compte dans ce club');
      }
      userId = currentUser.id;
    }

    try {
      return await this.prisma.adherent.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          birthDate,
          isMinor,
          ageCategory: dto.ageCategory,
          weightKg: dto.weightKg,
          licenceFFLDA: dto.licenceFFLDA,
          userId,
          tuteurId,
          clubId,
          status: 'DRAFT',
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async createDraft(clubId: string, dto: DraftAdherentDto, currentUser: CurrentUser) {
    await this.clubsService.assertMembership(clubId, currentUser);
    const roleInClub = await this.clubsService.getRoleInClub(clubId, currentUser);

    let userId: string | undefined;
    let tuteurId: string | undefined;

    if (roleInClub === 'TUTEUR') {
      tuteurId = currentUser.id;
    } else if (roleInClub === 'ADHERENT') {
      const existing = await this.prisma.adherent.findFirst({
        where: { userId: currentUser.id, clubId },
      });
      if (existing) {
        throw new BadRequestException('Une fiche adhérent existe déjà pour ce compte dans ce club');
      }
      userId = currentUser.id;
    }

    const birthDate = dto.birthDate ? new Date(dto.birthDate) : undefined;

    try {
      return await this.prisma.adherent.create({
        data: {
          firstName: dto.firstName ?? '',
          lastName: dto.lastName ?? '',
          birthDate: birthDate ?? new Date('1900-01-01'),
          isMinor: birthDate ? this.computeIsMinor(birthDate) : false,
          ageCategory: dto.ageCategory,
          weightKg: dto.weightKg,
          licenceFFLDA: dto.licenceFFLDA,
          userId,
          tuteurId,
          clubId,
          status: 'DRAFT',
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async saveDraft(id: string, dto: DraftAdherentDto, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    if (adherent.status !== 'DRAFT') {
      throw new BadRequestException('Ce dossier n\'est plus au stade brouillon, utilise la mise à jour normale');
    }
    await this.assertOwnership(adherent, currentUser);

    const data: any = { ...dto };
    if (dto.birthDate) {
      data.birthDate = new Date(dto.birthDate);
      data.isMinor = this.computeIsMinor(data.birthDate);
    }

    try {
      return await this.prisma.adherent.update({ where: { id }, data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(clubId: string, currentUser: CurrentUser) {
    const roleInClub = await this.clubsService.getRoleInClub(clubId, currentUser);

    if (STAFF_ROLES.includes(roleInClub)) {
      return this.prisma.adherent.findMany({
        where: { clubId },
        orderBy: { createdAt: 'desc' },
      });
    }
    if (roleInClub === 'TUTEUR') {
      return this.prisma.adherent.findMany({
        where: { clubId, tuteurId: currentUser.id },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.adherent.findMany({
      where: { clubId, userId: currentUser.id },
    });
  }

  async findOne(id: string, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    await this.assertOwnership(adherent, currentUser);
    return adherent;
  }

  async update(id: string, dto: UpdateAdherentDto, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    await this.assertOwnership(adherent, currentUser);

    const data: any = { ...dto };
    if (dto.birthDate) {
      data.birthDate = new Date(dto.birthDate);
      data.isMinor = this.computeIsMinor(data.birthDate);
    }

    try {
      return await this.prisma.adherent.update({ where: { id }, data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateStatus(id: string, dto: UpdateStatusDto, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
    if (!STAFF_ROLES.includes(roleInClub)) {
      throw new ForbiddenException('Seul le bureau peut modifier le statut d\'un dossier');
    }
    return this.prisma.adherent.update({ where: { id }, data: { status: dto.status } });
  }

  async remove(id: string, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
    if (!STAFF_ROLES.includes(roleInClub)) {
      throw new ForbiddenException('Seul le bureau peut supprimer une fiche adhérent');
    }
    return this.prisma.adherent.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  // ── Vérifie l'accès à UNE fiche précise, selon le rôle dans SON club ────────
  private async assertOwnership(
    adherent: { clubId: string; userId: string | null; tuteurId: string | null },
    currentUser: CurrentUser,
  ) {
    const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
    if (STAFF_ROLES.includes(roleInClub)) return;
    if (roleInClub === 'TUTEUR' && adherent.tuteurId === currentUser.id) return;
    if (roleInClub === 'ADHERENT' && adherent.userId === currentUser.id) return;
    throw new ForbiddenException('Accès refusé à cette fiche adhérent');
  }
}