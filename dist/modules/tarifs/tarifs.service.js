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
exports.TarifsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const clubs_service_1 = require("../clubs/clubs.service");
const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];
let TarifsService = class TarifsService {
    prisma;
    clubsService;
    constructor(prisma, clubsService) {
        this.prisma = prisma;
        this.clubsService = clubsService;
    }
    async assertStaff(clubId, currentUser) {
        const role = await this.clubsService.getRoleInClub(clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut gérer les tarifs');
        }
    }
    async setTarif(clubId, dto, currentUser) {
        await this.assertStaff(clubId, currentUser);
        return this.prisma.tarifCotisation.upsert({
            where: {
                clubId_saison_categorie: {
                    clubId,
                    saison: dto.saison,
                    categorie: (dto.categorie ?? null),
                },
            },
            update: { montant: dto.montant },
            create: {
                clubId,
                saison: dto.saison,
                categorie: dto.categorie ?? null,
                montant: dto.montant,
            },
        });
    }
    async findTarifs(clubId, saison, currentUser) {
        await this.assertStaff(clubId, currentUser);
        return this.prisma.tarifCotisation.findMany({
            where: { clubId, saison },
            orderBy: { categorie: 'asc' },
        });
    }
    async deleteTarif(tarifId, currentUser) {
        const tarif = await this.prisma.tarifCotisation.findUnique({ where: { id: tarifId } });
        if (!tarif)
            throw new common_1.NotFoundException('Tarif introuvable');
        await this.assertStaff(tarif.clubId, currentUser);
        return this.prisma.tarifCotisation.delete({ where: { id: tarifId } });
    }
    async createCodePromo(clubId, dto, currentUser) {
        await this.assertStaff(clubId, currentUser);
        const codeNormalized = dto.code.trim().toUpperCase();
        const existing = await this.prisma.codePromo.findUnique({
            where: { clubId_code: { clubId, code: codeNormalized } },
        });
        if (existing) {
            throw new common_1.ConflictException('Ce code promo existe déjà pour ce club');
        }
        return this.prisma.codePromo.create({
            data: {
                clubId,
                code: codeNormalized,
                typeReduction: dto.typeReduction,
                valeur: dto.valeur,
                dateExpiration: dto.dateExpiration ? new Date(dto.dateExpiration) : undefined,
            },
        });
    }
    async findCodesPromo(clubId, currentUser) {
        await this.assertStaff(clubId, currentUser);
        return this.prisma.codePromo.findMany({
            where: { clubId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateCodePromo(codePromoId, dto, currentUser) {
        const codePromo = await this.prisma.codePromo.findUnique({ where: { id: codePromoId } });
        if (!codePromo)
            throw new common_1.NotFoundException('Code promo introuvable');
        await this.assertStaff(codePromo.clubId, currentUser);
        return this.prisma.codePromo.update({
            where: { id: codePromoId },
            data: {
                ...(dto.actif !== undefined && { actif: dto.actif }),
                ...(dto.valeur !== undefined && { valeur: dto.valeur }),
            },
        });
    }
    async calculerMontant(params) {
        const { clubId, saison, adherentId, codePromo } = params;
        const detailReductions = [];
        const adherent = await this.prisma.adherent.findUnique({ where: { id: adherentId } });
        if (!adherent)
            throw new common_1.NotFoundException('Adhérent introuvable');
        let tarif = adherent.ageCategory
            ? await this.prisma.tarifCotisation.findUnique({
                where: { clubId_saison_categorie: { clubId, saison, categorie: adherent.ageCategory } },
            })
            : null;
        if (!tarif) {
            tarif = await this.prisma.tarifCotisation.findUnique({
                where: { clubId_saison_categorie: { clubId, saison, categorie: null } },
            });
        }
        if (!tarif) {
            throw new common_1.BadRequestException(`Aucun tarif configuré pour la saison ${saison}${adherent.ageCategory ? ` (catégorie ${adherent.ageCategory})` : ''}. Configure un tarif avant de générer les cotisations.`);
        }
        let montant = tarif.montant;
        const montantBase = tarif.montant;
        if (adherent.tuteurId) {
            const siblingsCount = await this.prisma.adherent.count({
                where: {
                    clubId,
                    tuteurId: adherent.tuteurId,
                    status: 'VALIDATED',
                    id: { not: adherentId },
                },
            });
            if (siblingsCount > 0) {
                const reduction = montant * 0.10;
                montant -= reduction;
                detailReductions.push(`Réduction famille (-10%) : -${reduction.toFixed(2)}€`);
            }
        }
        let codePromoApplique = null;
        if (codePromo) {
            const codeNormalized = codePromo.trim().toUpperCase();
            const promo = await this.prisma.codePromo.findUnique({
                where: { clubId_code: { clubId, code: codeNormalized } },
            });
            if (!promo || !promo.actif) {
                throw new common_1.BadRequestException('Code promo invalide ou inactif');
            }
            if (promo.dateExpiration && new Date() > promo.dateExpiration) {
                throw new common_1.BadRequestException('Ce code promo a expiré');
            }
            const reduction = promo.typeReduction === 'POURCENTAGE' ? montant * (promo.valeur / 100) : promo.valeur;
            montant -= reduction;
            detailReductions.push(`Code promo "${promo.code}" : -${reduction.toFixed(2)}€`);
            codePromoApplique = promo.code;
        }
        montant = Math.max(0, Math.round(montant * 100) / 100);
        return { montantBase, montantFinal: montant, codePromoApplique, detailReductions };
    }
};
exports.TarifsService = TarifsService;
exports.TarifsService = TarifsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        clubs_service_1.ClubsService])
], TarifsService);
