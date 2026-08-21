import { Injectable, ForbiddenException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubsService } from '../clubs/clubs.service';
import { SetTarifDto, CreateCodePromoDto, UpdateCodePromoDto } from './dto/tarif.dto';

interface CurrentUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];

@Injectable()
export class TarifsService {
  constructor(
    private prisma: PrismaService,
    private clubsService: ClubsService,
  ) {}

  private async assertStaff(clubId: string, currentUser: CurrentUser) {
    const role = await this.clubsService.getRoleInClub(clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException('Seul le staff du club peut gérer les tarifs');
    }
  }

  // ── Définit (ou remplace) le tarif d'une catégorie pour une saison ──────
  async setTarif(clubId: string, dto: SetTarifDto, currentUser: CurrentUser) {
    await this.assertStaff(clubId, currentUser);

    return this.prisma.tarifCotisation.upsert({
      where: {
        clubId_saison_categorie: {
          clubId,
          saison: dto.saison,
          categorie: (dto.categorie ?? null) as any,
        },
      },
      update: { montant: dto.montant },
      create: {
        clubId,
        saison: dto.saison,
        categorie: dto.categorie ?? null,
        montant: dto.montant,
      },
    });
  }

  async findTarifs(clubId: string, saison: string, currentUser: CurrentUser) {
    await this.assertStaff(clubId, currentUser);
    return this.prisma.tarifCotisation.findMany({
      where: { clubId, saison },
      orderBy: { categorie: 'asc' },
    });
  }

  async deleteTarif(tarifId: string, currentUser: CurrentUser) {
    const tarif = await this.prisma.tarifCotisation.findUnique({ where: { id: tarifId } });
    if (!tarif) throw new NotFoundException('Tarif introuvable');
    await this.assertStaff(tarif.clubId, currentUser);
    return this.prisma.tarifCotisation.delete({ where: { id: tarifId } });
  }

  // ── Codes promo ───────────────────────────────────────────────────────
  async createCodePromo(clubId: string, dto: CreateCodePromoDto, currentUser: CurrentUser) {
    await this.assertStaff(clubId, currentUser);

    const codeNormalized = dto.code.trim().toUpperCase();
    const existing = await this.prisma.codePromo.findUnique({
      where: { clubId_code: { clubId, code: codeNormalized } },
    });
    if (existing) {
      throw new ConflictException('Ce code promo existe déjà pour ce club');
    }

    return this.prisma.codePromo.create({
      data: {
        clubId,
        code: codeNormalized,
        typeReduction: dto.typeReduction,
        valeur: dto.valeur,
        dateExpiration: dto.dateExpiration ? new Date(dto.dateExpiration) : undefined,
      },
    });
  }

  async findCodesPromo(clubId: string, currentUser: CurrentUser) {
    await this.assertStaff(clubId, currentUser);
    return this.prisma.codePromo.findMany({
      where: { clubId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCodePromo(codePromoId: string, dto: UpdateCodePromoDto, currentUser: CurrentUser) {
    const codePromo = await this.prisma.codePromo.findUnique({ where: { id: codePromoId } });
    if (!codePromo) throw new NotFoundException('Code promo introuvable');
    await this.assertStaff(codePromo.clubId, currentUser);

    return this.prisma.codePromo.update({
      where: { id: codePromoId },
      data: {
        ...(dto.actif !== undefined && { actif: dto.actif }),
        ...(dto.valeur !== undefined && { valeur: dto.valeur }),
      },
    });
  }

  // ── LE CŒUR DU SYSTÈME : calcule le montant final d'une cotisation ──────
  // Ordre d'application :
  // 1. Tarif de base = tarif spécifique à la catégorie de l'adhérent, sinon
  //    tarif par défaut du club (categorie = null), sinon erreur (aucun tarif configuré).
  // 2. Réduction famille = si le même tuteur a déjà d'autres adhérents validés
  //    dans ce club pour cette saison, applique 10% de réduction automatique
  //    à partir du 2e enfant (taux fixe pour l'instant, pourra devenir configurable).
  // 3. Code promo = si fourni et valide, applique la réduction par-dessus.
  async calculerMontant(params: {
    clubId: string;
    saison: string;
    adherentId: string;
    codePromo?: string;
  }): Promise<{ montantBase: number; montantFinal: number; codePromoApplique: string | null; detailReductions: string[] }> {
    const { clubId, saison, adherentId, codePromo } = params;
    const detailReductions: string[] = [];

    const adherent = await this.prisma.adherent.findUnique({ where: { id: adherentId } });
    if (!adherent) throw new NotFoundException('Adhérent introuvable');

    // 1. Tarif de base
    let tarif = adherent.ageCategory
      ? await this.prisma.tarifCotisation.findUnique({
          where: { clubId_saison_categorie: { clubId, saison, categorie: adherent.ageCategory } },
        })
      : null;

    if (!tarif) {
      tarif = await this.prisma.tarifCotisation.findUnique({
        where: { clubId_saison_categorie: { clubId, saison, categorie: null as any } },
      });
    }

    if (!tarif) {
      throw new BadRequestException(
        `Aucun tarif configuré pour la saison ${saison}${adherent.ageCategory ? ` (catégorie ${adherent.ageCategory})` : ''}. Configure un tarif avant de générer les cotisations.`,
      );
    }

    let montant = tarif.montant;
    const montantBase = tarif.montant;

    // 2. Réduction famille (10% à partir du 2e enfant du même tuteur, dans le même club/saison)
    if (adherent.tuteurId) {
      const siblingsCount = await this.prisma.adherent.count({
        where: {
          clubId,
          tuteurId: adherent.tuteurId,
          status: 'VALIDATED',
          id: { not: adherentId },
        },
      });
      if (siblingsCount > 0) {
        const reduction = montant * 0.10;
        montant -= reduction;
        detailReductions.push(`Réduction famille (-10%) : -${reduction.toFixed(2)}€`);
      }
    }

    // 3. Code promo
    let codePromoApplique: string | null = null;
    if (codePromo) {
      const codeNormalized = codePromo.trim().toUpperCase();
      const promo = await this.prisma.codePromo.findUnique({
        where: { clubId_code: { clubId, code: codeNormalized } },
      });

      if (!promo || !promo.actif) {
        throw new BadRequestException('Code promo invalide ou inactif');
      }
      if (promo.dateExpiration && new Date() > promo.dateExpiration) {
        throw new BadRequestException('Ce code promo a expiré');
      }

      const reduction =
        promo.typeReduction === 'POURCENTAGE' ? montant * (promo.valeur / 100) : promo.valeur;
      montant -= reduction;
      detailReductions.push(`Code promo "${promo.code}" : -${reduction.toFixed(2)}€`);
      codePromoApplique = promo.code;
    }

    montant = Math.max(0, Math.round(montant * 100) / 100); // jamais négatif, arrondi au centime

    return { montantBase, montantFinal: montant, codePromoApplique, detailReductions };
  }
}