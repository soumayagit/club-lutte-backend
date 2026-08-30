import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubsService } from '../clubs/clubs.service';
import { CreateGroupeDto, UpdateGroupeDto, CreateCreneauDto } from './dto/groupe.dto';

interface CurrentUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];

@Injectable()
export class GroupesService {
  constructor(
    private prisma: PrismaService,
    private clubsService: ClubsService,
  ) {}

  private async assertStaff(clubId: string, currentUser: CurrentUser) {
    const role = await this.clubsService.getRoleInClub(clubId, currentUser);
    if (!STAFF_ROLES.includes(role)) {
      throw new ForbiddenException('Seul le staff du club peut gérer les groupes');
    }
  }

  // ── Crée un groupe ────────────────────────────────────────────────────
  async create(clubId: string, dto: CreateGroupeDto, currentUser: CurrentUser) {
    await this.assertStaff(clubId, currentUser);
    return this.prisma.groupe.create({
      data: { clubId, nom: dto.nom, categorie: dto.categorie, description: dto.description },
    });
  }

  // ── Liste les groupes du club, avec le nombre de membres ─────────────────
  async findByClub(clubId: string, currentUser: CurrentUser) {
    // Accessible à tous les membres du club (pas juste le staff) — un
    // adhérent doit pouvoir voir ses propres groupes.
    await this.clubsService.assertMembership(clubId, currentUser);

    const groupes = await this.prisma.groupe.findMany({
      where: { clubId },
      include: {
        membres: true,
        creneaux: true,
        entraineurs: { include: { user: true } },
      },
      orderBy: { nom: 'asc' },
    });

    return groupes.map((g) => ({
      id: g.id,
      nom: g.nom,
      categorie: g.categorie,
      description: g.description,
      nbMembres: g.membres.length,
      creneaux: g.creneaux,
      entraineurs: g.entraineurs.map((e) => ({
        userId: e.userId,
        nom: `${e.user.firstName} ${e.user.lastName}`,
      })),
    }));
  }

  async findOne(groupeId: string, currentUser: CurrentUser) {
    const groupe = await this.prisma.groupe.findUnique({
      where: { id: groupeId },
      include: {
        membres: { include: { adherent: true } },
        creneaux: true,
        entraineurs: { include: { user: true } },
      },
    });
    if (!groupe) throw new NotFoundException('Groupe introuvable');
    await this.clubsService.assertMembership(groupe.clubId, currentUser);

    return {
      id: groupe.id,
      nom: groupe.nom,
      categorie: groupe.categorie,
      description: groupe.description,
      creneaux: groupe.creneaux,
      entraineurs: groupe.entraineurs.map((e) => ({
        userId: e.userId,
        nom: `${e.user.firstName} ${e.user.lastName}`,
      })),
      membres: groupe.membres.map((m) => ({
        adherentId: m.adherentId,
        nom: `${m.adherent.firstName} ${m.adherent.lastName}`,
      })),
    };
  }

  async update(groupeId: string, dto: UpdateGroupeDto, currentUser: CurrentUser) {
    const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');
    await this.assertStaff(groupe.clubId, currentUser);

    return this.prisma.groupe.update({ where: { id: groupeId }, data: dto });
  }

  async remove(groupeId: string, currentUser: CurrentUser) {
    const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');
    await this.assertStaff(groupe.clubId, currentUser);

    return this.prisma.groupe.delete({ where: { id: groupeId } });
  }

  // ── Ajoute/retire un adhérent d'un groupe ────────────────────────────────
  async addMembre(groupeId: string, adherentId: string, currentUser: CurrentUser) {
    const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');
    await this.assertStaff(groupe.clubId, currentUser);

    return this.prisma.membreGroupe.upsert({
      where: { groupeId_adherentId: { groupeId, adherentId } },
      update: {},
      create: { groupeId, adherentId },
    });
  }

  async removeMembre(groupeId: string, adherentId: string, currentUser: CurrentUser) {
    const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');
    await this.assertStaff(groupe.clubId, currentUser);

    return this.prisma.membreGroupe.delete({
      where: { groupeId_adherentId: { groupeId, adherentId } },
    });
  }

  // ── Affecte/retire un entraîneur ─────────────────────────────────────────
  async addEntraineur(groupeId: string, userId: string, currentUser: CurrentUser) {
    const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');
    await this.assertStaff(groupe.clubId, currentUser);

    return this.prisma.entraineurGroupe.upsert({
      where: { groupeId_userId: { groupeId, userId } },
      update: {},
      create: { groupeId, userId },
    });
  }

  // ── Créneaux récurrents ───────────────────────────────────────────────
  async addCreneau(groupeId: string, dto: CreateCreneauDto, currentUser: CurrentUser) {
    const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');
    await this.assertStaff(groupe.clubId, currentUser);

    return this.prisma.creneau.create({
      data: { groupeId, jour: dto.jour, heureDebut: dto.heureDebut, heureFin: dto.heureFin, lieu: dto.lieu },
    });
  }

  async removeCreneau(creneauId: string, currentUser: CurrentUser) {
    const creneau = await this.prisma.creneau.findUnique({
      where: { id: creneauId },
      include: { groupe: true },
    });
    if (!creneau) throw new NotFoundException('Créneau introuvable');
    await this.assertStaff(creneau.groupe.clubId, currentUser);

    return this.prisma.creneau.delete({ where: { id: creneauId } });
  }
}