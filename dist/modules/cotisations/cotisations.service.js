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
exports.CotisationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const clubs_service_1 = require("../clubs/clubs.service");
const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];
let CotisationsService = class CotisationsService {
    prisma;
    clubsService;
    constructor(prisma, clubsService) {
        this.prisma = prisma;
        this.clubsService = clubsService;
    }
    async assertStaffAccess(adherentId, currentUser) {
        const adherent = await this.prisma.adherent.findUnique({ where: { id: adherentId } });
        if (!adherent) {
            throw new common_1.NotFoundException('Adhérent introuvable');
        }
        const role = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut gérer les cotisations');
        }
        return adherent.clubId;
    }
    async create(adherentId, dto, currentUser) {
        await this.assertStaffAccess(adherentId, currentUser);
        const existing = await this.prisma.cotisation.findUnique({
            where: { adherentId_saison: { adherentId, saison: dto.saison } },
        });
        if (existing) {
            throw new common_1.ConflictException('Une cotisation existe déjà pour cette saison');
        }
        return this.prisma.cotisation.create({
            data: {
                adherentId,
                saison: dto.saison,
                montant: dto.montant,
                statut: 'IMPAYE',
            },
        });
    }
    async findByClub(clubId, saison, currentUser) {
        const role = await this.clubsService.getRoleInClub(clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut voir les cotisations');
        }
        const cotisations = await this.prisma.cotisation.findMany({
            where: { saison, adherent: { clubId } },
            include: { adherent: true },
            orderBy: { adherent: { lastName: 'asc' } },
        });
        return cotisations.map((c) => ({
            id: c.id,
            adherentId: c.adherentId,
            adherentNom: `${c.adherent.firstName} ${c.adherent.lastName}`,
            saison: c.saison,
            montant: c.montant,
            statut: c.statut,
            datePaiement: c.datePaiement,
            moyenPaiement: c.moyenPaiement,
        }));
    }
    async update(cotisationId, dto, currentUser) {
        const cotisation = await this.prisma.cotisation.findUnique({ where: { id: cotisationId } });
        if (!cotisation) {
            throw new common_1.NotFoundException('Cotisation introuvable');
        }
        await this.assertStaffAccess(cotisation.adherentId, currentUser);
        return this.prisma.cotisation.update({
            where: { id: cotisationId },
            data: {
                ...(dto.statut !== undefined && { statut: dto.statut }),
                ...(dto.montant !== undefined && { montant: dto.montant }),
                ...(dto.moyenPaiement !== undefined && { moyenPaiement: dto.moyenPaiement }),
                ...(dto.statut === 'PAYE' && { datePaiement: new Date() }),
            },
        });
    }
    async generateForClub(clubId, saison, montant, currentUser) {
        const role = await this.clubsService.getRoleInClub(clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut générer les cotisations');
        }
        const adherents = await this.prisma.adherent.findMany({
            where: { clubId, status: 'VALIDATED' },
        });
        let created = 0;
        for (const a of adherents) {
            const existing = await this.prisma.cotisation.findUnique({
                where: { adherentId_saison: { adherentId: a.id, saison } },
            });
            if (!existing) {
                await this.prisma.cotisation.create({
                    data: { adherentId: a.id, saison, montant, statut: 'IMPAYE' },
                });
                created++;
            }
        }
        return { created, total: adherents.length };
    }
};
exports.CotisationsService = CotisationsService;
exports.CotisationsService = CotisationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        clubs_service_1.ClubsService])
], CotisationsService);
