import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubsService } from '../clubs/clubs.service';
import { CreateSeanceDto, UpdateSeanceDto, MarquerPresenceDto, AppelGroupeDto } from './dto/presence.dto';

interface CurrentUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];

@Injectable()
export class PresencesService {
  constructor(
    private prisma: PrismaService,
    private clubsService: ClubsService,
  ) {}

  private async assertStaffOnGroupe(groupeId: string, currentUser: CurrentUser) {
    const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');
    const role = await this.clubsService.getRoleInClub(groupe.clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException("Seul l'entraîneur/staff peut gérer les séances de ce groupe");
    }
    return groupe;
  }

  // ── Crée une séance pour un groupe — les présences "NON_RENSEIGNE" sont
  // créées automatiquement pour chaque membre actuel du groupe ─────────────
  async createSeance(groupeId: string, dto: CreateSeanceDto, currentUser: CurrentUser) {
    await this.assertStaffOnGroupe(groupeId, currentUser);

    const seance = await this.prisma.seance.create({
      data: { groupeId, date: new Date(dto.date), lieu: dto.lieu },
    });

    const membres = await this.prisma.membreGroupe.findMany({ where: { groupeId } });
    if (membres.length > 0) {
      await this.prisma.presence.createMany({
        data: membres.map((m) => ({ seanceId: seance.id, adherentId: m.adherentId, statut: 'NON_RENSEIGNE' })),
      });
    }

    return seance;
  }

  async findSeancesByGroupe(groupeId: string, currentUser: CurrentUser) {
    const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');
    await this.clubsService.assertMembership(groupe.clubId, currentUser);

    return this.prisma.seance.findMany({
      where: { groupeId },
      orderBy: { date: 'desc' },
    });
  }

  async updateSeance(seanceId: string, dto: UpdateSeanceDto, currentUser: CurrentUser) {
    const seance = await this.prisma.seance.findUnique({ where: { id: seanceId }, include: { groupe: true } });
    if (!seance) throw new NotFoundException('Séance introuvable');
    const role = await this.clubsService.getRoleInClub(seance.groupe.clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException("Seul l'entraîneur/staff peut modifier cette séance");
    }

    return this.prisma.seance.update({
      where: { id: seanceId },
      data: {
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.lieu !== undefined && { lieu: dto.lieu }),
        ...(dto.annulee !== undefined && { annulee: dto.annulee }),
        ...(dto.commentaire !== undefined && { commentaire: dto.commentaire }),
      },
    });
  }

  // ── Liste les présences d'une séance, avec le nom de chaque adhérent ────
  async findPresencesBySeance(seanceId: string, currentUser: CurrentUser) {
    const seance = await this.prisma.seance.findUnique({ where: { id: seanceId }, include: { groupe: true } });
    if (!seance) throw new NotFoundException('Séance introuvable');
    await this.clubsService.assertMembership(seance.groupe.clubId, currentUser);

    const presences = await this.prisma.presence.findMany({
      where: { seanceId },
      include: { adherent: true },
    });

    return presences.map((p) => ({
      id: p.id,
      adherentId: p.adherentId,
      adherentNom: `${p.adherent.firstName} ${p.adherent.lastName}`,
      statut: p.statut,
      commentaire: p.commentaire,
    }));
  }

  // ── Marque UNE présence individuelle ─────────────────────────────────────
  async marquerPresence(presenceId: string, dto: MarquerPresenceDto, currentUser: CurrentUser) {
    const presence = await this.prisma.presence.findUnique({
      where: { id: presenceId },
      include: { seance: { include: { groupe: true } } },
    });
    if (!presence) throw new NotFoundException('Présence introuvable');
    const role = await this.clubsService.getRoleInClub(presence.seance.groupe.clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException("Seul l'entraîneur/staff peut faire l'appel");
    }

    return this.prisma.presence.update({
      where: { id: presenceId },
      data: { statut: dto.statut, commentaire: dto.commentaire },
    });
  }

  // ── Fait l'appel pour TOUT un groupe en une seule requête ────────────────
  async appelGroupe(seanceId: string, dto: AppelGroupeDto, currentUser: CurrentUser) {
    const seance = await this.prisma.seance.findUnique({ where: { id: seanceId }, include: { groupe: true } });
    if (!seance) throw new NotFoundException('Séance introuvable');
    const role = await this.clubsService.getRoleInClub(seance.groupe.clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException("Seul l'entraîneur/staff peut faire l'appel");
    }

    for (const p of dto.presences) {
      await this.prisma.presence.upsert({
        where: { seanceId_adherentId: { seanceId, adherentId: p.adherentId } },
        update: { statut: p.statut, commentaire: p.commentaire },
        create: { seanceId, adherentId: p.adherentId, statut: p.statut, commentaire: p.commentaire },
      });
    }

    return { success: true, nbTraites: dto.presences.length };
  }

  // ── Statistiques de présence d'un adhérent (taux, historique) ────────────
  async statsAdherent(adherentId: string, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id: adherentId } });
    if (!adherent) throw new NotFoundException('Adhérent introuvable');
    const role = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);

    const isOwner =
      (role === 'ADHERENT' && adherent.userId === currentUser.id) ||
      (role === 'TUTEUR' && adherent.tuteurId === currentUser.id);
    if (!STAFF_ROLES.includes(role) && !isOwner) {
      throw new ForbiddenException('Accès refusé à ces statistiques');
    }

    const presences = await this.prisma.presence.findMany({
      where: { adherentId, statut: { not: 'NON_RENSEIGNE' } },
      include: { seance: true },
      orderBy: { seance: { date: 'desc' } },
    });

    const total = presences.length;
    const nbPresent = presences.filter((p) => p.statut === 'PRESENT').length;
    const tauxPresence = total > 0 ? Math.round((nbPresent / total) * 100) : 0;

    return {
      tauxPresence,
      total,
      nbPresent,
      nbAbsent: presences.filter((p) => p.statut === 'ABSENT').length,
      nbRetard: presences.filter((p) => p.statut === 'RETARD').length,
      nbExcuse: presences.filter((p) => p.statut === 'EXCUSE').length,
      historique: presences.slice(0, 10).map((p) => ({
        date: p.seance.date,
        statut: p.statut,
      })),
    };
  }
}