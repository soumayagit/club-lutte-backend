import { Injectable, ForbiddenException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdherentDto, UpdateAdherentDto, UpdateStatusDto, DraftAdherentDto } from './dto/adherent.dto';

interface CurrentUser {
  id: string;
  email: string;
  role: string;
}

const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];

@Injectable()
export class AdherentsService {
  constructor(private prisma: PrismaService) {}

  private computeIsMinor(birthDate: Date): boolean {
    const age = (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age < 18;
  }

  // ── Traduit les erreurs Prisma connues en erreurs HTTP claires ────────────
  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[] | undefined) ?? [];
        if (target.includes('licenceFFLDA')) {
          throw new ConflictException('Ce numéro de licence FFLDA est déjà utilisé par un autre adhérent');
        }
        throw new ConflictException('Une valeur unique est déjà utilisée par un autre enregistrement');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Adhérent introuvable');
      }
    }
    throw error;
  }

  async create(dto: CreateAdherentDto, currentUser: CurrentUser) {
    const birthDate = new Date(dto.birthDate);
    const isMinor = this.computeIsMinor(birthDate);

    let userId: string | undefined;
    let tuteurId: string | undefined;

    if (STAFF_ROLES.includes(currentUser.role)) {
      tuteurId = dto.tuteurId;
    } else if (currentUser.role === 'TUTEUR') {
      if (!isMinor) {
        throw new BadRequestException('Un tuteur ne peut créer que des fiches d\'adhérents mineurs');
      }
      tuteurId = currentUser.id;
    } else if (currentUser.role === 'ADHERENT') {
      if (isMinor) {
        throw new BadRequestException('Un compte adhérent majeur ne peut pas créer de fiche mineure — un tuteur doit s\'en charger');
      }
      const existing = await this.prisma.adherent.findUnique({ where: { userId: currentUser.id } });
      if (existing) {
        throw new BadRequestException('Une fiche adhérent existe déjà pour ce compte');
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
          status: 'DRAFT',
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // ── Brouillon : création initiale, tout est optionnel ──────────────────────
  async createDraft(dto: DraftAdherentDto, currentUser: CurrentUser) {
    let userId: string | undefined;
    let tuteurId: string | undefined;

    if (currentUser.role === 'TUTEUR') {
      tuteurId = currentUser.id;
    } else if (currentUser.role === 'ADHERENT') {
      const existing = await this.prisma.adherent.findUnique({ where: { userId: currentUser.id } });
      if (existing) {
        throw new BadRequestException('Une fiche adhérent existe déjà pour ce compte');
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
          status: 'DRAFT',
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // ── Brouillon : sauvegarde partielle sur un brouillon existant ─────────────
  async saveDraft(id: string, dto: DraftAdherentDto, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    if (adherent.status !== 'DRAFT') {
      throw new BadRequestException('Ce dossier n\'est plus au stade brouillon, utilise la mise à jour normale');
    }
    this.assertOwnership(adherent, currentUser);

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

  async findAll(currentUser: CurrentUser) {
    if (STAFF_ROLES.includes(currentUser.role)) {
      return this.prisma.adherent.findMany({ orderBy: { createdAt: 'desc' } });
    }
    if (currentUser.role === 'TUTEUR') {
      return this.prisma.adherent.findMany({
        where: { tuteurId: currentUser.id },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.adherent.findMany({
      where: { userId: currentUser.id },
    });
  }

  async findOne(id: string, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    this.assertOwnership(adherent, currentUser);
    return adherent;
  }

  async update(id: string, dto: UpdateAdherentDto, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    this.assertOwnership(adherent, currentUser);

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
    if (!STAFF_ROLES.includes(currentUser.role)) {
      throw new ForbiddenException('Seul le bureau peut modifier le statut d\'un dossier');
    }
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    return this.prisma.adherent.update({ where: { id }, data: { status: dto.status } });
  }

  async remove(id: string, currentUser: CurrentUser) {
    if (!STAFF_ROLES.includes(currentUser.role)) {
      throw new ForbiddenException('Seul le bureau peut supprimer une fiche adhérent');
    }
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    return this.prisma.adherent.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  private assertOwnership(adherent: { userId: string | null; tuteurId: string | null }, currentUser: CurrentUser) {
    if (STAFF_ROLES.includes(currentUser.role)) return;
    if (currentUser.role === 'TUTEUR' && adherent.tuteurId === currentUser.id) return;
    if (currentUser.role === 'ADHERENT' && adherent.userId === currentUser.id) return;
    throw new ForbiddenException('Accès refusé à cette fiche adhérent');
  }
}