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
exports.DeplacementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const clubs_service_1 = require("../clubs/clubs.service");
const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];
let DeplacementsService = class DeplacementsService {
    prisma;
    clubsService;
    constructor(prisma, clubsService) {
        this.prisma = prisma;
        this.clubsService = clubsService;
    }
    async assertStaff(clubId, currentUser) {
        const role = await this.clubsService.getRoleInClub(clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut gérer les déplacements');
        }
        return role;
    }
    async create(clubId, dto, currentUser) {
        await this.assertStaff(clubId, currentUser);
        return this.prisma.deplacement.create({
            data: {
                clubId,
                titre: dto.titre,
                lieu: dto.lieu,
                dateDepart: new Date(dto.dateDepart),
                dateRetour: dto.dateRetour ? new Date(dto.dateRetour) : undefined,
                heureRdv: dto.heureRdv,
                lieuRdv: dto.lieuRdv,
                competitionId: dto.competitionId,
            },
        });
    }
    async findByClub(clubId, currentUser) {
        await this.clubsService.assertMembership(clubId, currentUser);
        return this.prisma.deplacement.findMany({
            where: { clubId },
            orderBy: { dateDepart: 'asc' },
            include: { participants: true, vehicules: { include: { passagers: true } } },
        });
    }
    async update(deplacementId, dto, currentUser) {
        const deplacement = await this.prisma.deplacement.findUnique({ where: { id: deplacementId } });
        if (!deplacement)
            throw new common_1.NotFoundException('Déplacement introuvable');
        await this.assertStaff(deplacement.clubId, currentUser);
        return this.prisma.deplacement.update({
            where: { id: deplacementId },
            data: {
                ...(dto.titre !== undefined && { titre: dto.titre }),
                ...(dto.lieu !== undefined && { lieu: dto.lieu }),
                ...(dto.dateDepart !== undefined && { dateDepart: new Date(dto.dateDepart) }),
                ...(dto.dateRetour !== undefined && { dateRetour: new Date(dto.dateRetour) }),
                ...(dto.heureRdv !== undefined && { heureRdv: dto.heureRdv }),
                ...(dto.lieuRdv !== undefined && { lieuRdv: dto.lieuRdv }),
                ...(dto.statut !== undefined && { statut: dto.statut }),
            },
        });
    }
    async addParticipants(deplacementId, dto, currentUser) {
        const deplacement = await this.prisma.deplacement.findUnique({ where: { id: deplacementId } });
        if (!deplacement)
            throw new common_1.NotFoundException('Déplacement introuvable');
        await this.assertStaff(deplacement.clubId, currentUser);
        for (const adherentId of dto.adherentIds) {
            await this.prisma.participantDeplacement.upsert({
                where: { deplacementId_adherentId: { deplacementId, adherentId } },
                update: {},
                create: { deplacementId, adherentId },
            });
        }
        return { success: true, nbAjoutes: dto.adherentIds.length };
    }
    async proposerVehicule(deplacementId, dto, currentUser) {
        const deplacement = await this.prisma.deplacement.findUnique({ where: { id: deplacementId } });
        if (!deplacement)
            throw new common_1.NotFoundException('Déplacement introuvable');
        await this.clubsService.assertMembership(deplacement.clubId, currentUser);
        return this.prisma.vehiculeCovoiturage.create({
            data: {
                deplacementId,
                conducteurId: currentUser.id,
                nbPlaces: dto.nbPlaces,
                pointDepart: dto.pointDepart,
                contraintes: dto.contraintes,
            },
        });
    }
    async findVehicules(deplacementId, currentUser) {
        const deplacement = await this.prisma.deplacement.findUnique({ where: { id: deplacementId } });
        if (!deplacement)
            throw new common_1.NotFoundException('Déplacement introuvable');
        await this.clubsService.assertMembership(deplacement.clubId, currentUser);
        const vehicules = await this.prisma.vehiculeCovoiturage.findMany({
            where: { deplacementId },
            include: { conducteur: true, passagers: { include: { adherent: true } } },
        });
        const role = await this.clubsService.getRoleInClub(deplacement.clubId, currentUser);
        const isStaff = STAFF_ROLES.includes(role);
        return vehicules.map((v) => {
            const estImplique = isStaff ||
                v.conducteurId === currentUser.id ||
                v.passagers.some((p) => p.adherent.userId === currentUser.id || p.adherent.tuteurId === currentUser.id);
            return {
                id: v.id,
                nbPlaces: v.nbPlaces,
                pointDepart: v.pointDepart,
                contraintes: v.contraintes,
                conducteurNom: `${v.conducteur.firstName} ${v.conducteur.lastName}`,
                conducteurTelephone: estImplique ? v.conducteur.phone : null,
                passagers: v.passagers.map((p) => ({
                    adherentId: p.adherentId,
                    nom: `${p.adherent.firstName} ${p.adherent.lastName}`,
                    autorisationOk: p.autorisationOk,
                    telephone: estImplique ? p.adherent.telephone : null,
                })),
            };
        });
    }
    async affecterPassager(vehiculeId, dto, currentUser) {
        const vehicule = await this.prisma.vehiculeCovoiturage.findUnique({
            where: { id: vehiculeId },
            include: { deplacement: true, passagers: true },
        });
        if (!vehicule)
            throw new common_1.NotFoundException('Véhicule introuvable');
        await this.assertStaff(vehicule.deplacement.clubId, currentUser);
        if (vehicule.passagers.length >= vehicule.nbPlaces) {
            throw new common_1.BadRequestException('Ce véhicule est déjà complet');
        }
        return this.prisma.passagerVehicule.create({
            data: { vehiculeId, adherentId: dto.adherentId },
        });
    }
    async retirerPassager(passagerId, currentUser) {
        const passager = await this.prisma.passagerVehicule.findUnique({
            where: { id: passagerId },
            include: { vehicule: { include: { deplacement: true } } },
        });
        if (!passager)
            throw new common_1.NotFoundException('Affectation introuvable');
        await this.assertStaff(passager.vehicule.deplacement.clubId, currentUser);
        return this.prisma.passagerVehicule.delete({ where: { id: passagerId } });
    }
    async validerAutorisation(passagerId, dto, currentUser) {
        const passager = await this.prisma.passagerVehicule.findUnique({
            where: { id: passagerId },
            include: { vehicule: { include: { deplacement: true } }, adherent: true },
        });
        if (!passager)
            throw new common_1.NotFoundException('Affectation introuvable');
        await this.assertStaff(passager.vehicule.deplacement.clubId, currentUser);
        return this.prisma.passagerVehicule.update({
            where: { id: passagerId },
            data: { autorisationOk: dto.autorisationOk },
        });
    }
    async validerPlanTransport(deplacementId, currentUser) {
        const deplacement = await this.prisma.deplacement.findUnique({
            where: { id: deplacementId },
            include: { vehicules: { include: { passagers: { include: { adherent: true } } } } },
        });
        if (!deplacement)
            throw new common_1.NotFoundException('Déplacement introuvable');
        await this.assertStaff(deplacement.clubId, currentUser);
        for (const vehicule of deplacement.vehicules) {
            for (const passager of vehicule.passagers) {
                if (passager.adherent.isMinor && !passager.autorisationOk) {
                    throw new common_1.BadRequestException(`${passager.adherent.firstName} ${passager.adherent.lastName} est mineur et n'a pas d'autorisation parentale validée pour ce déplacement`);
                }
            }
        }
        return this.prisma.deplacement.update({
            where: { id: deplacementId },
            data: { statut: 'VALIDE' },
        });
    }
};
exports.DeplacementsService = DeplacementsService;
exports.DeplacementsService = DeplacementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        clubs_service_1.ClubsService])
], DeplacementsService);
