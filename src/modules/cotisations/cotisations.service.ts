import { Injectable, ForbiddenException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubsService } from '../clubs/clubs.service';
import { TarifsService } from '../tarifs/tarifs.service';
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
    private tarifsService: TarifsService,
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

  // ── Vérifie que la personne peut voir/agir sur SA PROPRE cotisation ─────
  private async assertOwnerOrStaff(adherentId: string, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id: adherentId } });
    if (!adherent) throw new NotFoundException('Adhérent introuvable');
    const role = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);

    const isOwner =
      (role === 'ADHERENT' && adherent.userId === currentUser.id) ||
      (role === 'TUTEUR' && adherent.tuteurId === currentUser.id);

    if (!STAFF_ROLES.includes(role) && !isOwner) {
      throw new ForbiddenException('Accès refusé à cette cotisation');
    }
    return adherent;
  }

  // ── Crée une cotisation avec calcul automatique du montant (tarif + réductions) ──
  async create(adherentId: string, dto: CreateCotisationDto, currentUser: CurrentUser) {
    const clubId = await this.assertStaffAccess(adherentId, currentUser);

    const existing = await this.prisma.cotisation.findUnique({
      where: { adherentId_saison: { adherentId, saison: dto.saison } },
    });
    if (existing) {
      throw new ConflictException('Une cotisation existe déjà pour cette saison');
    }

    const { montantBase, montantFinal, codePromoApplique } = await this.tarifsService.calculerMontant({
      clubId,
      saison: dto.saison,
      adherentId,
      codePromo: dto.codePromo,
    });

    return this.prisma.cotisation.create({
      data: {
        adherentId,
        saison: dto.saison,
        montant: montantFinal,
        montantBase,
        codePromoUtilise: codePromoApplique,
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

    return cotisations.map((c) => this.toDto(c));
  }

  // ── La cotisation d'UN adhérent précis — accessible par lui-même (ou son tuteur) ──
  async findMine(adherentId: string, saison: string, currentUser: CurrentUser) {
    await this.assertOwnerOrStaff(adherentId, currentUser);
    const cotisation = await this.prisma.cotisation.findUnique({
      where: { adherentId_saison: { adherentId, saison } },
      include: { adherent: true },
    });
    if (!cotisation) throw new NotFoundException('Aucune cotisation trouvée pour cette saison');
    return this.toDto(cotisation);
  }

  private toDto(c: any) {
    const resteAPayer = c.statut === 'PARTIEL' ? Math.max(0, c.montant - (c.montantVerse ?? 0)) : 0;
    return {
      id: c.id,
      adherentId: c.adherentId,
      adherentNom: `${c.adherent.firstName} ${c.adherent.lastName}`,
      saison: c.saison,
      montant: c.montant,
      montantBase: c.montantBase,
      montantVerse: c.montantVerse,
      resteAPayer,
      codePromoUtilise: c.codePromoUtilise,
      statut: c.statut,
      echeance: c.echeance,
      datePaiement: c.datePaiement,
      moyenPaiement: c.moyenPaiement,
      prestataire: c.prestataire,
      recuUrl: c.recuUrl,
    };
  }

  // ── Le staff (trésorier) marque payé/partiel/en attente, avec le mode utilisé ──
  async update(cotisationId: string, dto: UpdateCotisationDto, currentUser: CurrentUser) {
    const cotisation = await this.prisma.cotisation.findUnique({ where: { id: cotisationId } });
    if (!cotisation) {
      throw new NotFoundException('Cotisation introuvable');
    }
    await this.assertStaffAccess(cotisation.adherentId, currentUser);

    // Si on marque "PAYE" sans préciser montantVerse, on considère que le
    // montant total a été versé — cohérence automatique, pas besoin de le
    // ressaisir à chaque fois pour le cas simple (le plus fréquent).
    let montantVerse = dto.montantVerse;
    if (dto.statut === 'PAYE' && montantVerse === undefined) {
      montantVerse = dto.montant ?? cotisation.montant;
    }
    if (dto.statut === 'PARTIEL' && montantVerse === undefined) {
      throw new BadRequestException('Le montant versé est obligatoire pour un paiement partiel');
    }

    return this.prisma.cotisation.update({
      where: { id: cotisationId },
      data: {
        ...(dto.statut !== undefined && { statut: dto.statut }),
        ...(dto.montant !== undefined && { montant: dto.montant }),
        ...(montantVerse !== undefined && { montantVerse }),
        ...(dto.moyenPaiement !== undefined && { moyenPaiement: dto.moyenPaiement }),
        ...(dto.prestataire !== undefined && { prestataire: dto.prestataire }),
        ...(dto.echeance !== undefined && { echeance: new Date(dto.echeance) }),
        ...((dto.statut === 'PAYE' || dto.statut === 'PARTIEL') && { datePaiement: new Date() }),
      },
    });
  }

  // ── Génère automatiquement une cotisation pour chaque adhérent validé,
  // avec le montant calculé selon le tarif de SA catégorie (plus de montant
  // unique passé en paramètre — chacun paie selon les règles configurées) ──
  async generateForClub(clubId: string, saison: string, currentUser: CurrentUser, echeance?: string) {
    const role = await this.clubsService.getRoleInClub(clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException('Seul le staff du club peut générer les cotisations');
    }

    const adherents = await this.prisma.adherent.findMany({
      where: { clubId, status: 'VALIDATED' },
    });

    let created = 0;
    const echecs: string[] = [];

    for (const a of adherents) {
      const existing = await this.prisma.cotisation.findUnique({
        where: { adherentId_saison: { adherentId: a.id, saison } },
      });
      if (existing) continue;

      try {
        const { montantBase, montantFinal } = await this.tarifsService.calculerMontant({
          clubId,
          saison,
          adherentId: a.id,
        });

        await this.prisma.cotisation.create({
          data: {
            adherentId: a.id,
            saison,
            montant: montantFinal,
            montantBase,
            statut: 'IMPAYE',
            echeance: echeance ? new Date(echeance) : undefined,
          },
        });
        created++;
      } catch (e) {
        // Pas de tarif configuré pour cette catégorie — on continue les autres
        // plutôt que de bloquer toute la génération.
        echecs.push(`${a.firstName} ${a.lastName} (${a.ageCategory ?? 'sans catégorie'})`);
      }
    }

    return { created, total: adherents.length, echecs };
  }

  // ── Tableau de suivi financier : totaux + répartition, pour le trésorier ──
  async getTableauFinancier(clubId: string, saison: string, currentUser: CurrentUser) {
    const role = await this.clubsService.getRoleInClub(clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException('Seul le staff du club peut voir le suivi financier');
    }

    const cotisations = await this.prisma.cotisation.findMany({
      where: { saison, adherent: { clubId } },
    });

    let totalAttendu = 0;
    let totalEncaisse = 0;
    let totalRestant = 0;
    let nbPaye = 0;
    let nbImpaye = 0;
    let nbPartiel = 0;

    for (const c of cotisations) {
      totalAttendu += c.montant;
      if (c.statut === 'PAYE') {
        totalEncaisse += c.montant;
        nbPaye++;
      } else if (c.statut === 'PARTIEL') {
        const verse = c.montantVerse ?? 0;
        totalEncaisse += verse;
        totalRestant += c.montant - verse;
        nbPartiel++;
      } else {
        totalRestant += c.montant;
        nbImpaye++;
      }
    }

    return {
      saison,
      totalAttendu: Math.round(totalAttendu * 100) / 100,
      totalEncaisse: Math.round(totalEncaisse * 100) / 100,
      totalRestant: Math.round(totalRestant * 100) / 100,
      nbTotal: cotisations.length,
      nbPaye,
      nbImpaye,
      nbPartiel,
    };
  }

  // ── Export CSV du détail des cotisations — pour le trésorier ─────────────
  async exportCsv(clubId: string, saison: string, currentUser: CurrentUser): Promise<string> {
    const role = await this.clubsService.getRoleInClub(clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException('Seul le staff du club peut exporter les cotisations');
    }

    const cotisations = await this.prisma.cotisation.findMany({
      where: { saison, adherent: { clubId } },
      include: { adherent: true },
      orderBy: { adherent: { lastName: 'asc' } },
    });

    const lignes = ['Nom,Prenom,Montant,MontantVerse,Statut,MoyenPaiement,DatePaiement,Echeance'];

    for (const c of cotisations) {
      const ligne = [
        c.adherent.lastName,
        c.adherent.firstName,
        c.montant.toFixed(2),
        (c.montantVerse ?? '').toString(),
        c.statut,
        c.moyenPaiement ?? '',
        c.datePaiement ? c.datePaiement.toISOString().split('T')[0] : '',
        c.echeance ? c.echeance.toISOString().split('T')[0] : '',
      ].join(',');
      lignes.push(ligne);
    }

    return lignes.join('\n');
  }
}