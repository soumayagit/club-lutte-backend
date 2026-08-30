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
exports.PresencesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const clubs_service_1 = require("../clubs/clubs.service");
const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];
let PresencesService = class PresencesService {
    prisma;
    clubsService;
    constructor(prisma, clubsService) {
        this.prisma = prisma;
        this.clubsService = clubsService;
    }
    async assertStaffOnGroupe(groupeId, currentUser) {
        const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
        const role = await this.clubsService.getRoleInClub(groupe.clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException("Seul l'entraîneur/staff peut gérer les séances de ce groupe");
        }
        return groupe;
    }
    async createSeance(groupeId, dto, currentUser) {
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
    async findSeancesByGroupe(groupeId, currentUser) {
        const groupe = await this.prisma.groupe.findUnique({ where: { id: groupeId } });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
        await this.clubsService.assertMembership(groupe.clubId, currentUser);
        return this.prisma.seance.findMany({
            where: { groupeId },
            orderBy: { date: 'desc' },
        });
    }
    async updateSeance(seanceId, dto, currentUser) {
        const seance = await this.prisma.seance.findUnique({ where: { id: seanceId }, include: { groupe: true } });
        if (!seance)
            throw new common_1.NotFoundException('Séance introuvable');
        const role = await this.clubsService.getRoleInClub(seance.groupe.clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException("Seul l'entraîneur/staff peut modifier cette séance");
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
    async findPresencesBySeance(seanceId, currentUser) {
        const seance = await this.prisma.seance.findUnique({ where: { id: seanceId }, include: { groupe: true } });
        if (!seance)
            throw new common_1.NotFoundException('Séance introuvable');
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
    async marquerPresence(presenceId, dto, currentUser) {
        const presence = await this.prisma.presence.findUnique({
            where: { id: presenceId },
            include: { seance: { include: { groupe: true } } },
        });
        if (!presence)
            throw new common_1.NotFoundException('Présence introuvable');
        const role = await this.clubsService.getRoleInClub(presence.seance.groupe.clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException("Seul l'entraîneur/staff peut faire l'appel");
        }
        return this.prisma.presence.update({
            where: { id: presenceId },
            data: { statut: dto.statut, commentaire: dto.commentaire },
        });
    }
    async appelGroupe(seanceId, dto, currentUser) {
        const seance = await this.prisma.seance.findUnique({ where: { id: seanceId }, include: { groupe: true } });
        if (!seance)
            throw new common_1.NotFoundException('Séance introuvable');
        const role = await this.clubsService.getRoleInClub(seance.groupe.clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException("Seul l'entraîneur/staff peut faire l'appel");
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
    async statsAdherent(adherentId, currentUser) {
        const adherent = await this.prisma.adherent.findUnique({ where: { id: adherentId } });
        if (!adherent)
            throw new common_1.NotFoundException('Adhérent introuvable');
        const role = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
        const isOwner = (role === 'ADHERENT' && adherent.userId === currentUser.id) ||
            (role === 'TUTEUR' && adherent.tuteurId === currentUser.id);
        if (!STAFF_ROLES.includes(role) && !isOwner) {
            throw new common_1.ForbiddenException('Accès refusé à ces statistiques');
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
};
exports.PresencesService = PresencesService;
exports.PresencesService = PresencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        clubs_service_1.ClubsService])
], PresencesService);
