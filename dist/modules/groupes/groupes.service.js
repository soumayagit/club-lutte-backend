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
exports.GroupesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const clubs_service_1 = require("../clubs/clubs.service");
const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];
let GroupesService = class GroupesService {
    prisma;
    clubsService;
    constructor(prisma, clubsService) {
        this.prisma = prisma;
        this.clubsService = clubsService;
    }
    async assertStaff(clubId, currentUser) {
        const role = await this.clubsService.getRoleInClub(clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut gérer les groupes');
        }
    }
    async create(clubId, dto, currentUser) {
        await this.assertStaff(clubId, currentUser);
        return this.prisma.groupe.create({
            data: { clubId, nom: dto.nom, categorie: dto.categorie, description: dto.description },
        });
    }
    async findByClub(clubId, currentUser) {
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
    async findOne(groupeId, currentUser) {
        const groupe = await this.prisma.groupe.findUnique({
            where: { id: groupeId },
            include: {
                membres: { include: { adherent: true } },
                creneaux: true,
                entraineurs: { include: { user: true } },
            },
        });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
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
    async update(groupeId, dto, currentUser) {
        const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
        await this.assertStaff(groupe.clubId, currentUser);
        return this.prisma.groupe.update({ where: { id: groupeId }, data: dto });
    }
    async remove(groupeId, currentUser) {
        const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
        await this.assertStaff(groupe.clubId, currentUser);
        return this.prisma.groupe.delete({ where: { id: groupeId } });
    }
    async addMembre(groupeId, adherentId, currentUser) {
        const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
        await this.assertStaff(groupe.clubId, currentUser);
        return this.prisma.membreGroupe.upsert({
            where: { groupeId_adherentId: { groupeId, adherentId } },
            update: {},
            create: { groupeId, adherentId },
        });
    }
    async removeMembre(groupeId, adherentId, currentUser) {
        const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
        await this.assertStaff(groupe.clubId, currentUser);
        return this.prisma.membreGroupe.delete({
            where: { groupeId_adherentId: { groupeId, adherentId } },
        });
    }
    async addEntraineur(groupeId, userId, currentUser) {
        const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
        await this.assertStaff(groupe.clubId, currentUser);
        return this.prisma.entraineurGroupe.upsert({
            where: { groupeId_userId: { groupeId, userId } },
            update: {},
            create: { groupeId, userId },
        });
    }
    async addCreneau(groupeId, dto, currentUser) {
        const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
        await this.assertStaff(groupe.clubId, currentUser);
        return this.prisma.creneau.create({
            data: { groupeId, jour: dto.jour, heureDebut: dto.heureDebut, heureFin: dto.heureFin, lieu: dto.lieu },
        });
    }
    async removeCreneau(creneauId, currentUser) {
        const creneau = await this.prisma.creneau.findUnique({
            where: { id: creneauId },
            include: { groupe: true },
        });
        if (!creneau)
            throw new common_1.NotFoundException('Créneau introuvable');
        await this.assertStaff(creneau.groupe.clubId, currentUser);
        return this.prisma.creneau.delete({ where: { id: creneauId } });
    }
};
exports.GroupesService = GroupesService;
exports.GroupesService = GroupesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        clubs_service_1.ClubsService])
], GroupesService);
