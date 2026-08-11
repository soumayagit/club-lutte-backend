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

  // ── Génère un code d'invitation court et lisible, du genre "ETOILE-2K7X" ──
  private generateInviteCode(nom: string): string {
    const prefix = nom
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // retire les accents
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .slice(0, 6) || 'CLUB';

    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}-${suffix}`;
  }

  private async generateUniqueInviteCode(nom: string): Promise<string> {
    let code = this.generateInviteCode(nom);
    let attempts = 0;
    while (await this.prisma.club.findUnique({ where: { inviteCode: code } })) {
      code = this.generateInviteCode(nom);
      attempts++;
      if (attempts > 10) {
        // Ultra improbable, mais on évite une boucle infinie
        code = `${code}-${Date.now().toString(36).toUpperCase()}`;
        break;
      }
    }
    return code;
  }

  // ── Crée un club : le créateur en devient automatiquement ADMIN ─────────
  async create(dto: CreateClubDto, currentUser: CurrentUser) {
    const inviteCode = await this.generateUniqueInviteCode(dto.nom);

    const club = await this.prisma.club.create({
      data: {
        nom: dto.nom,
        ville: dto.ville,
        logoUrl: dto.logoUrl,
        description: dto.description,
        federation: dto.federation,
        inviteCode,
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
      // Le code d'invitation n'est visible QUE par le staff — pas utile/pas sûr
      // de le montrer à un simple adhérent.
      inviteCode: ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'].includes(m.role)
        ? m.club.inviteCode
        : null,
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

  // ── Rejoindre un club via son CODE D'INVITATION (pas l'UUID technique) ──
  async join(dto: JoinClubDto, currentUser: CurrentUser) {
    const club = await this.prisma.club.findUnique({
      where: { inviteCode: dto.inviteCode.trim().toUpperCase() },
    });
    if (!club) {
      throw new NotFoundException('Code d\'invitation invalide');
    }

    const existing = await this.prisma.clubMembership.findUnique({
      where: { userId_clubId: { userId: currentUser.id, clubId: club.id } },
    });
    if (existing) {
      throw new ConflictException('Tu es déjà membre de ce club');
    }

    await this.prisma.clubMembership.create({
      data: {
        userId: currentUser.id,
        clubId: club.id,
        role: 'ADHERENT',
      },
    });

    return club;
  }

  // ── Vérifie que l'utilisateur appartient bien à ce club (sinon 403) ─────
  async assertMembership(clubId: string, currentUser: CurrentUser) {
    if (currentUser.isSuperAdmin) return null;

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