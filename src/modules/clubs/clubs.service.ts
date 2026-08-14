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

  private generateInviteCode(nom: string): string {
    const prefix = nom
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
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
        code = `${code}-${Date.now().toString(36).toUpperCase()}`;
        break;
      }
    }
    return code;
  }

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

  async join(dto: JoinClubDto, currentUser: CurrentUser) {
    const club = await this.prisma.club.findUnique({
      where: { inviteCode: dto.inviteCode.trim().toUpperCase() },
    });
    if (!club) {
      throw new NotFoundException("Code d'invitation invalide");
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

  async getRoleInClub(clubId: string, currentUser: CurrentUser): Promise<string> {
    if (currentUser.isSuperAdmin) return 'ADMIN';
    const membership = await this.assertMembership(clubId, currentUser);
    return membership!.role;
  }

  async updateLogo(clubId: string, logoUrl: string, currentUser: CurrentUser) {
    const role = await this.getRoleInClub(clubId, currentUser);
    if (!['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'].includes(role)) {
      throw new ForbiddenException('Seul le staff du club peut modifier le logo');
    }

    return this.prisma.club.update({
      where: { id: clubId },
      data: { logoUrl },
    });
  }

  async getMembers(clubId: string, currentUser: CurrentUser) {
    const role = await this.getRoleInClub(clubId, currentUser);
    if (!['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'].includes(role)) {
      throw new ForbiddenException('Seul le staff du club peut voir la liste des membres');
    }

    const memberships = await this.prisma.clubMembership.findMany({
      where: { clubId, dateFin: null },
      include: { user: true },
      orderBy: { dateDebut: 'asc' },
    });

    return memberships.map((m) => ({
      userId: m.userId,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      email: m.user.email,
      role: m.role,
      dateDebut: m.dateDebut,
    }));
  }

  async updateMemberRole(
    clubId: string,
    targetUserId: string,
    newRole: string,
    currentUser: CurrentUser,
  ) {
    const role = await this.getRoleInClub(clubId, currentUser);
    if (role !== 'ADMIN' && !currentUser.isSuperAdmin) {
      throw new ForbiddenException("Seul un Admin du club peut changer le rôle d'un membre");
    }

    const membership = await this.prisma.clubMembership.findUnique({
      where: { userId_clubId: { userId: targetUserId, clubId } },
    });
    if (!membership) {
      throw new NotFoundException("Ce membre n'appartient pas à ce club");
    }

    if (targetUserId === currentUser.id && newRole !== 'ADMIN') {
      const adminCount = await this.prisma.clubMembership.count({
        where: { clubId, role: 'ADMIN', dateFin: null },
      });
      if (adminCount <= 1) {
        throw new ForbiddenException(
          'Tu es le seul Admin de ce club — nomme un autre Admin avant de changer ton propre rôle',
        );
      }
    }

    return this.prisma.clubMembership.update({
      where: { userId_clubId: { userId: targetUserId, clubId } },
      data: { role: newRole as any },
    });
  }

  async updateInfo(clubId: string, dto: any, currentUser: CurrentUser) {
    const role = await this.getRoleInClub(clubId, currentUser);
    if (!['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'].includes(role)) {
      throw new ForbiddenException('Seul le staff du club peut modifier ses informations');
    }

    return this.prisma.club.update({
      where: { id: clubId },
      data: {
        ...(dto.nom !== undefined && { nom: dto.nom }),
        ...(dto.ville !== undefined && { ville: dto.ville }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.federation !== undefined && { federation: dto.federation }),
      },
    });
  }

  async removeMember(clubId: string, targetUserId: string, currentUser: CurrentUser) {
    const role = await this.getRoleInClub(clubId, currentUser);
    if (role !== 'ADMIN' && !currentUser.isSuperAdmin) {
      throw new ForbiddenException('Seul un Admin du club peut retirer un membre');
    }

    const membership = await this.prisma.clubMembership.findUnique({
      where: { userId_clubId: { userId: targetUserId, clubId } },
    });
    if (!membership) {
      throw new NotFoundException("Ce membre n'appartient pas à ce club");
    }

    if (targetUserId === currentUser.id) {
      const adminCount = await this.prisma.clubMembership.count({
        where: { clubId, role: 'ADMIN', dateFin: null },
      });
      if (adminCount <= 1) {
        throw new ForbiddenException(
          'Tu es le seul Admin de ce club — nomme un autre Admin avant de te retirer',
        );
      }
    }

    return this.prisma.clubMembership.update({
      where: { userId_clubId: { userId: targetUserId, clubId } },
      data: { dateFin: new Date() },
    });
  }
}