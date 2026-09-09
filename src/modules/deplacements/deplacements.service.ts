import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubsService } from '../clubs/clubs.service';
import {
  CreateDeplacementDto,
  UpdateDeplacementDto,
  AddParticipantsDto,
  ProposerVehiculeDto,
  AffecterPassagerDto,
  ValiderAutorisationDto,
} from './dto/deplacement.dto';

interface CurrentUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];

@Injectable()
export class DeplacementsService {
  constructor(
    private prisma: PrismaService,
    private clubsService: ClubsService,
  ) {}

  private async assertStaff(clubId: string, currentUser: CurrentUser) {
    const role = await this.clubsService.getRoleInClub(clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException('Seul le staff du club peut gérer les déplacements');
    }
    return role;
  }

  // ── TRIP-001 : Création d'un déplacement ─────────────────────────────
  async create(clubId: string, dto: CreateDeplacementDto, currentUser: CurrentUser) {
    await this.assertStaff(clubId, currentUser);

    return this.prisma.deplacement.create({
      data: {
        clubId,
        titre: dto.titre,
        lieu: dto.lieu,
        dateDepart: new Date(dto.dateDepart),
        dateRetour: dto.dateRetour ? new Date(dto.dateRetour) : undefined,
        heureRdv: dto.heureRdv,
        lieuRdv: dto.lieuRdv,
        competitionId: dto.competitionId,
      },
    });
  }

  async findByClub(clubId: string, currentUser: CurrentUser) {
    await this.clubsService.assertMembership(clubId, currentUser);
    return this.prisma.deplacement.findMany({
      where: { clubId },
      orderBy: { dateDepart: 'asc' },
      include: { participants: true, vehicules: { include: { passagers: true } } },
    });
  }

  async update(deplacementId: string, dto: UpdateDeplacementDto, currentUser: CurrentUser) {
    const deplacement = await this.prisma.deplacement.findUnique({ where: { id: deplacementId } });
    if (!deplacement) throw new NotFoundException('Déplacement introuvable');
    await this.assertStaff(deplacement.clubId, currentUser);

    return this.prisma.deplacement.update({
      where: { id: deplacementId },
      data: {
        ...(dto.titre !== undefined && { titre: dto.titre }),
        ...(dto.lieu !== undefined && { lieu: dto.lieu }),
        ...(dto.dateDepart !== undefined && { dateDepart: new Date(dto.dateDepart) }),
        ...(dto.dateRetour !== undefined && { dateRetour: new Date(dto.dateRetour) }),
        ...(dto.heureRdv !== undefined && { heureRdv: dto.heureRdv }),
        ...(dto.lieuRdv !== undefined && { lieuRdv: dto.lieuRdv }),
        ...(dto.statut !== undefined && { statut: dto.statut }),
      },
    });
    // TRIP-005 : notifier les participants d'un changement — TODO une fois
    // le système de notifications push branché.
  }

  // ── TRIP-001 : Ajoute des participants au déplacement ────────────────
  async addParticipants(deplacementId: string, dto: AddParticipantsDto, currentUser: CurrentUser) {
    const deplacement = await this.prisma.deplacement.findUnique({ where: { id: deplacementId } });
    if (!deplacement) throw new NotFoundException('Déplacement introuvable');
    await this.assertStaff(deplacement.clubId, currentUser);

    for (const adherentId of dto.adherentIds) {
      await this.prisma.participantDeplacement.upsert({
        where: { deplacementId_adherentId: { deplacementId, adherentId } },
        update: {},
        create: { deplacementId, adherentId },
      });
    }
    return { success: true, nbAjoutes: dto.adherentIds.length };
  }

  // ── TRIP-002 : Un conducteur propose un véhicule ──────────────────────
  async proposerVehicule(deplacementId: string, dto: ProposerVehiculeDto, currentUser: CurrentUser) {
    const deplacement = await this.prisma.deplacement.findUnique({ where: { id: deplacementId } });
    if (!deplacement) throw new NotFoundException('Déplacement introuvable');
    // N'importe quel membre du club peut proposer un véhicule (pas juste le staff).
    await this.clubsService.assertMembership(deplacement.clubId, currentUser);

    return this.prisma.vehiculeCovoiturage.create({
      data: {
        deplacementId,
        conducteurId: currentUser.id,
        nbPlaces: dto.nbPlaces,
        pointDepart: dto.pointDepart,
        contraintes: dto.contraintes,
      },
    });
  }

  async findVehicules(deplacementId: string, currentUser: CurrentUser) {
    const deplacement = await this.prisma.deplacement.findUnique({ where: { id: deplacementId } });
    if (!deplacement) throw new NotFoundException('Déplacement introuvable');
    await this.clubsService.assertMembership(deplacement.clubId, currentUser);

    const vehicules = await this.prisma.vehiculeCovoiturage.findMany({
      where: { deplacementId },
      include: { conducteur: true, passagers: { include: { adherent: true } } },
    });

    // ── TRIP-007 : les coordonnées (téléphone) ne sont incluses QUE si
    // l'utilisateur actuel est lui-même impliqué dans CE véhicule précis
    // (conducteur ou l'un des passagers) — sinon elles sont masquées. ────
    const role = await this.clubsService.getRoleInClub(deplacement.clubId, currentUser);
    const isStaff = STAFF_ROLES.includes(role);

    return vehicules.map((v) => {
      const estImplique =
        isStaff ||
        v.conducteurId === currentUser.id ||
        v.passagers.some(
          (p) => p.adherent.userId === currentUser.id || p.adherent.tuteurId === currentUser.id,
        );

      return {
        id: v.id,
        nbPlaces: v.nbPlaces,
        pointDepart: v.pointDepart,
        contraintes: v.contraintes,
        conducteurNom: `${v.conducteur.firstName} ${v.conducteur.lastName}`,
        conducteurTelephone: estImplique ? v.conducteur.telephone : null,
        passagers: v.passagers.map((p) => ({
          adherentId: p.adherentId,
          nom: `${p.adherent.firstName} ${p.adherent.lastName}`,
          autorisationOk: p.autorisationOk,
          telephone: estImplique ? p.adherent.telephone : null,
        })),
      };
    });
  }

  // ── TRIP-003 : Affecte un passager à un véhicule ─────────────────────
  async affecterPassager(vehiculeId: string, dto: AffecterPassagerDto, currentUser: CurrentUser) {
    const vehicule = await this.prisma.vehiculeCovoiturage.findUnique({
      where: { id: vehiculeId },
      include: { deplacement: true, passagers: true },
    });
    if (!vehicule) throw new NotFoundException('Véhicule introuvable');
    await this.assertStaff(vehicule.deplacement.clubId, currentUser);

    if (vehicule.passagers.length >= vehicule.nbPlaces) {
      throw new BadRequestException('Ce véhicule est déjà complet');
    }

    return this.prisma.passagerVehicule.create({
      data: { vehiculeId, adherentId: dto.adherentId },
    });
  }

  async retirerPassager(passagerId: string, currentUser: CurrentUser) {
    const passager = await this.prisma.passagerVehicule.findUnique({
      where: { id: passagerId },
      include: { vehicule: { include: { deplacement: true } } },
    });
    if (!passager) throw new NotFoundException('Affectation introuvable');
    await this.assertStaff(passager.vehicule.deplacement.clubId, currentUser);

    return this.prisma.passagerVehicule.delete({ where: { id: passagerId } });
  }

  // ── TRIP-004 : Valide l'autorisation parentale pour ce passager précis ──
  async validerAutorisation(passagerId: string, dto: ValiderAutorisationDto, currentUser: CurrentUser) {
    const passager = await this.prisma.passagerVehicule.findUnique({
      where: { id: passagerId },
      include: { vehicule: { include: { deplacement: true } }, adherent: true },
    });
    if (!passager) throw new NotFoundException('Affectation introuvable');
    await this.assertStaff(passager.vehicule.deplacement.clubId, currentUser);

    return this.prisma.passagerVehicule.update({
      where: { id: passagerId },
      data: { autorisationOk: dto.autorisationOk },
    });
  }

  // ── TRIP-003 : Valide le plan de transport final — bloque si un mineur
  // n'a pas son autorisation (TRIP-004). ───────────────────────────────
  async validerPlanTransport(deplacementId: string, currentUser: CurrentUser) {
    const deplacement = await this.prisma.deplacement.findUnique({
      where: { id: deplacementId },
      include: { vehicules: { include: { passagers: { include: { adherent: true } } } } },
    });
    if (!deplacement) throw new NotFoundException('Déplacement introuvable');
    await this.assertStaff(deplacement.clubId, currentUser);

    for (const vehicule of deplacement.vehicules) {
      for (const passager of vehicule.passagers) {
        if (passager.adherent.isMinor && !passager.autorisationOk) {
          throw new BadRequestException(
            `${passager.adherent.firstName} ${passager.adherent.lastName} est mineur et n'a pas d'autorisation parentale validée pour ce déplacement`,
          );
        }
      }
    }

    return this.prisma.deplacement.update({
      where: { id: deplacementId },
      data: { statut: 'VALIDE' },
    });
    // TRIP-005 : notifier tous les participants que le plan est confirmé — TODO.
  }
}