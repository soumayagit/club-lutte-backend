import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubDto, JoinClubDto } from './dto/club.dto';

interface CurrentUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  // ── Crée un club : le créateur en devient automatiquement ADMIN ─────────
  async create(dto: CreateClubDto, currentUser: CurrentUser) {
    const club = await this.prisma.club.create({
      data: {
        nom: dto.nom,
        ville: dto.ville,
        logoUrl: dto.logoUrl,
        description: dto.description,
        federation: dto.federation,
      },
    });

    await this.prisma.clubMembership.create({
      data: {
        userId: currentUser.id,
        clubId: club.id,
        role: 'ADMIN',
      },
    });

    return club;
  }

  // ── Liste les clubs auxquels l'utilisateur connecté appartient ──────────
  async findMine(currentUser: CurrentUser) {
    const memberships = await this.prisma.clubMembership.findMany({
      where: { userId: currentUser.id, dateFin: null },
      include: { club: true },
      orderBy: { dateDebut: 'desc' },
    });

    // Compte les adhérents de chaque club en une seule requête groupée
    const clubIds = memberships.map((m) => m.clubId);
    const counts = await this.prisma.adherent.groupBy({
      by: ['clubId'],
      where: { clubId: { in: clubIds }, status: { not: 'ARCHIVED' } },
      _count: { id: true },
    });
    const countMap = new Map(counts.map((c) => [c.clubId, c._count.id]));

    return memberships.map((m) => ({
      id: m.club.id,
      nom: m.club.nom,
      ville: m.club.ville,
      logoUrl: m.club.logoUrl,
      federation: m.club.federation,
      role: m.role,
      adherentsCount: countMap.get(m.clubId) ?? 0,
    }));
  }

  async findOne(clubId: string, currentUser: CurrentUser) {
    await this.assertMembership(clubId, currentUser);
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      throw new NotFoundException('Club introuvable');
    }
    return club;
  }

  // ── Rejoindre un club existant (rôle ADHERENT par défaut) ────────────────
  async join(dto: JoinClubDto, currentUser: CurrentUser) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.clubId } });
    if (!club) {
      throw new NotFoundException('Club introuvable');
    }

    const existing = await this.prisma.clubMembership.findUnique({
      where: { userId_clubId: { userId: currentUser.id, clubId: dto.clubId } },
    });
    if (existing) {
      throw new ConflictException('Tu es déjà membre de ce club');
    }

    return this.prisma.clubMembership.create({
      data: {
        userId: currentUser.id,
        clubId: dto.clubId,
        role: 'ADHERENT',
      },
    });
  }

  // ── Vérifie que l'utilisateur appartient bien à ce club (sinon 403) ─────
  async assertMembership(clubId: string, currentUser: CurrentUser) {
    if (currentUser.isSuperAdmin) return null; // accès total pour le super admin technique

    const membership = await this.prisma.clubMembership.findUnique({
      where: { userId_clubId: { userId: currentUser.id, clubId } },
    });

    if (!membership || membership.dateFin) {
      throw new ForbiddenException("Tu n'appartiens pas à ce club");
    }

    return membership;
  }

  // ── Récupère le rôle de l'utilisateur dans ce club précis ────────────────
  async getRoleInClub(clubId: string, currentUser: CurrentUser): Promise<string> {
    if (currentUser.isSuperAdmin) return 'ADMIN';
    const membership = await this.assertMembership(clubId, currentUser);
    return membership!.role;
  }
}