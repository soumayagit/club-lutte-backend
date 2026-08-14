"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClubsService = class ClubsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateInviteCode(nom) {
        const prefix = nom
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z]/g, '')
            .toUpperCase()
            .slice(0, 6) || 'CLUB';
        const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
        return `${prefix}-${suffix}`;
    }
    async generateUniqueInviteCode(nom) {
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
    async create(dto, currentUser) {
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
    async findMine(currentUser) {
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
    async findOne(clubId, currentUser) {
        await this.assertMembership(clubId, currentUser);
        const club = await this.prisma.club.findUnique({ where: { id: clubId } });
        if (!club) {
            throw new common_1.NotFoundException('Club introuvable');
        }
        return club;
    }
    async join(dto, currentUser) {
        const club = await this.prisma.club.findUnique({
            where: { inviteCode: dto.inviteCode.trim().toUpperCase() },
        });
        if (!club) {
            throw new common_1.NotFoundException("Code d'invitation invalide");
        }
        const existing = await this.prisma.clubMembership.findUnique({
            where: { userId_clubId: { userId: currentUser.id, clubId: club.id } },
        });
        if (existing) {
            throw new common_1.ConflictException('Tu es déjà membre de ce club');
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
    async assertMembership(clubId, currentUser) {
        if (currentUser.isSuperAdmin)
            return null;
        const membership = await this.prisma.clubMembership.findUnique({
            where: { userId_clubId: { userId: currentUser.id, clubId } },
        });
        if (!membership || membership.dateFin) {
            throw new common_1.ForbiddenException("Tu n'appartiens pas à ce club");
        }
        return membership;
    }
    async getRoleInClub(clubId, currentUser) {
        if (currentUser.isSuperAdmin)
            return 'ADMIN';
        const membership = await this.assertMembership(clubId, currentUser);
        return membership.role;
    }
    async updateLogo(clubId, logoUrl, currentUser) {
        const role = await this.getRoleInClub(clubId, currentUser);
        if (!['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'].includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut modifier le logo');
        }
        return this.prisma.club.update({
            where: { id: clubId },
            data: { logoUrl },
        });
    }
    async getMembers(clubId, currentUser) {
        const role = await this.getRoleInClub(clubId, currentUser);
        if (!['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'].includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut voir la liste des membres');
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
    async updateMemberRole(clubId, targetUserId, newRole, currentUser) {
        const role = await this.getRoleInClub(clubId, currentUser);
        if (role !== 'ADMIN' && !currentUser.isSuperAdmin) {
            throw new common_1.ForbiddenException("Seul un Admin du club peut changer le rôle d'un membre");
        }
        const membership = await this.prisma.clubMembership.findUnique({
            where: { userId_clubId: { userId: targetUserId, clubId } },
        });
        if (!membership) {
            throw new common_1.NotFoundException("Ce membre n'appartient pas à ce club");
        }
        if (targetUserId === currentUser.id && newRole !== 'ADMIN') {
            const adminCount = await this.prisma.clubMembership.count({
                where: { clubId, role: 'ADMIN', dateFin: null },
            });
            if (adminCount <= 1) {
                throw new common_1.ForbiddenException('Tu es le seul Admin de ce club — nomme un autre Admin avant de changer ton propre rôle');
            }
        }
        return this.prisma.clubMembership.update({
            where: { userId_clubId: { userId: targetUserId, clubId } },
            data: { role: newRole },
        });
    }
    async updateInfo(clubId, dto, currentUser) {
        const role = await this.getRoleInClub(clubId, currentUser);
        if (!['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'].includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut modifier ses informations');
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
    async removeMember(clubId, targetUserId, currentUser) {
        const role = await this.getRoleInClub(clubId, currentUser);
        if (role !== 'ADMIN' && !currentUser.isSuperAdmin) {
            throw new common_1.ForbiddenException('Seul un Admin du club peut retirer un membre');
        }
        const membership = await this.prisma.clubMembership.findUnique({
            where: { userId_clubId: { userId: targetUserId, clubId } },
        });
        if (!membership) {
            throw new common_1.NotFoundException("Ce membre n'appartient pas à ce club");
        }
        if (targetUserId === currentUser.id) {
            const adminCount = await this.prisma.clubMembership.count({
                where: { clubId, role: 'ADMIN', dateFin: null },
            });
            if (adminCount <= 1) {
                throw new common_1.ForbiddenException('Tu es le seul Admin de ce club — nomme un autre Admin avant de te retirer');
            }
        }
        return this.prisma.clubMembership.update({
            where: { userId_clubId: { userId: targetUserId, clubId } },
            data: { dateFin: new Date() },
        });
    }
};
exports.ClubsService = ClubsService;
exports.ClubsService = ClubsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClubsService);
