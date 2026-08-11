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
    async create(dto, currentUser) {
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
        const club = await this.prisma.club.findUnique({ where: { id: dto.clubId } });
        if (!club) {
            throw new common_1.NotFoundException('Club introuvable');
        }
        const existing = await this.prisma.clubMembership.findUnique({
            where: { userId_clubId: { userId: currentUser.id, clubId: dto.clubId } },
        });
        if (existing) {
            throw new common_1.ConflictException('Tu es déjà membre de ce club');
        }
        return this.prisma.clubMembership.create({
            data: {
                userId: currentUser.id,
                clubId: dto.clubId,
                role: 'ADHERENT',
            },
        });
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
};
exports.ClubsService = ClubsService;
exports.ClubsService = ClubsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClubsService);
