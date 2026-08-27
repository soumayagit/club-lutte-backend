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
const tarifs_service_1 = require("../tarifs/tarifs.service");
const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];
let CotisationsService = class CotisationsService {
    prisma;
    clubsService;
    tarifsService;
    constructor(prisma, clubsService, tarifsService) {
        this.prisma = prisma;
        this.clubsService = clubsService;
        this.tarifsService = tarifsService;
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
    async assertOwnerOrStaff(adherentId, currentUser) {
        const adherent = await this.prisma.adherent.findUnique({ where: { id: adherentId } });
        if (!adherent)
            throw new common_1.NotFoundException('Adhérent introuvable');
        const role = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
        const isOwner = (role === 'ADHERENT' && adherent.userId === currentUser.id) ||
            (role === 'TUTEUR' && adherent.tuteurId === currentUser.id);
        if (!STAFF_ROLES.includes(role) && !isOwner) {
            throw new common_1.ForbiddenException('Accès refusé à cette cotisation');
        }
        return adherent;
    }
    async create(adherentId, dto, currentUser) {
        const clubId = await this.assertStaffAccess(adherentId, currentUser);
        const existing = await this.prisma.cotisation.findUnique({
            where: { adherentId_saison: { adherentId, saison: dto.saison } },
        });
        if (existing) {
            throw new common_1.ConflictException('Une cotisation existe déjà pour cette saison');
        }
        const { montantBase, montantFinal, codePromoApplique } = await this.tarifsService.calculerMontant({
            clubId,
            saison: dto.saison,
            adherentId,
            codePromo: dto.codePromo,
        });
        return this.prisma.cotisation.create({
            data: {
                adherentId,
                saison: dto.saison,
                montant: montantFinal,
                montantBase,
                codePromoUtilise: codePromoApplique,
                statut: 'IMPAYE',
                echeance: dto.echeance ? new Date(dto.echeance) : undefined,
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
        return cotisations.map((c) => this.toDto(c));
    }
    async findMine(adherentId, saison, currentUser) {
        await this.assertOwnerOrStaff(adherentId, currentUser);
        const cotisation = await this.prisma.cotisation.findUnique({
            where: { adherentId_saison: { adherentId, saison } },
            include: { adherent: true },
        });
        if (!cotisation)
            throw new common_1.NotFoundException('Aucune cotisation trouvée pour cette saison');
        return this.toDto(cotisation);
    }
    toDto(c) {
        const resteAPayer = c.statut === 'PARTIEL' ? Math.max(0, c.montant - (c.montantVerse ?? 0)) : 0;
        return {
            id: c.id,
            adherentId: c.adherentId,
            adherentNom: `${c.adherent.firstName} ${c.adherent.lastName}`,
            saison: c.saison,
            montant: c.montant,
            montantBase: c.montantBase,
            montantVerse: c.montantVerse,
            resteAPayer,
            codePromoUtilise: c.codePromoUtilise,
            statut: c.statut,
            echeance: c.echeance,
            datePaiement: c.datePaiement,
            moyenPaiement: c.moyenPaiement,
            prestataire: c.prestataire,
            recuUrl: c.recuUrl,
        };
    }
    async update(cotisationId, dto, currentUser) {
        const cotisation = await this.prisma.cotisation.findUnique({ where: { id: cotisationId } });
        if (!cotisation) {
            throw new common_1.NotFoundException('Cotisation introuvable');
        }
        await this.assertStaffAccess(cotisation.adherentId, currentUser);
        let montantVerse = dto.montantVerse;
        if (dto.statut === 'PAYE' && montantVerse === undefined) {
            montantVerse = dto.montant ?? cotisation.montant;
        }
        if (dto.statut === 'PARTIEL' && montantVerse === undefined) {
            throw new common_1.BadRequestException('Le montant versé est obligatoire pour un paiement partiel');
        }
        return this.prisma.cotisation.update({
            where: { id: cotisationId },
            data: {
                ...(dto.statut !== undefined && { statut: dto.statut }),
                ...(dto.montant !== undefined && { montant: dto.montant }),
                ...(montantVerse !== undefined && { montantVerse }),
                ...(dto.moyenPaiement !== undefined && { moyenPaiement: dto.moyenPaiement }),
                ...(dto.prestataire !== undefined && { prestataire: dto.prestataire }),
                ...(dto.echeance !== undefined && { echeance: new Date(dto.echeance) }),
                ...((dto.statut === 'PAYE' || dto.statut === 'PARTIEL') && { datePaiement: new Date() }),
            },
        });
    }
    async generateForClub(clubId, saison, currentUser, echeance, nombreEcheances = 1) {
        const role = await this.clubsService.getRoleInClub(clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut générer les cotisations');
        }
        const adherents = await this.prisma.adherent.findMany({
            where: { clubId, status: 'VALIDATED' },
        });
        let created = 0;
        const echecs = [];
        const dateDepart = echeance ? new Date(echeance) : new Date();
        for (const a of adherents) {
            const existing = await this.prisma.cotisation.findUnique({
                where: { adherentId_saison: { adherentId: a.id, saison } },
            });
            if (existing)
                continue;
            try {
                const { montantBase, montantFinal } = await this.tarifsService.calculerMontant({
                    clubId,
                    saison,
                    adherentId: a.id,
                });
                const cotisation = await this.prisma.cotisation.create({
                    data: {
                        adherentId: a.id,
                        saison,
                        montant: montantFinal,
                        montantBase,
                        statut: 'IMPAYE',
                        echeance: nombreEcheances <= 1 && echeance ? new Date(echeance) : undefined,
                        paiementEnPlusieursFois: nombreEcheances > 1,
                    },
                });
                if (nombreEcheances > 1) {
                    const montantParEcheance = Math.floor((montantFinal / nombreEcheances) * 100) / 100;
                    let montantRestant = montantFinal;
                    for (let i = 1; i <= nombreEcheances; i++) {
                        const estDerniere = i === nombreEcheances;
                        const montantCetteEcheance = estDerniere
                            ? Math.round(montantRestant * 100) / 100
                            : montantParEcheance;
                        montantRestant -= montantCetteEcheance;
                        const dateEcheance = new Date(dateDepart);
                        dateEcheance.setMonth(dateEcheance.getMonth() + (i - 1));
                        await this.prisma.echeancePaiement.create({
                            data: {
                                cotisationId: cotisation.id,
                                numero: i,
                                montant: montantCetteEcheance,
                                dateEcheance,
                                statut: 'IMPAYE',
                            },
                        });
                    }
                }
                created++;
                created++;
            }
            catch (e) {
                echecs.push(`${a.firstName} ${a.lastName} (${a.ageCategory ?? 'sans catégorie'})`);
            }
        }
        return { created, total: adherents.length, echecs };
    }
    async getTableauFinancier(clubId, saison, currentUser) {
        const role = await this.clubsService.getRoleInClub(clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut voir le suivi financier');
        }
        const cotisations = await this.prisma.cotisation.findMany({
            where: { saison, adherent: { clubId } },
        });
        let totalAttendu = 0;
        let totalEncaisse = 0;
        let totalRestant = 0;
        let nbPaye = 0;
        let nbImpaye = 0;
        let nbPartiel = 0;
        for (const c of cotisations) {
            totalAttendu += c.montant;
            if (c.statut === 'PAYE') {
                totalEncaisse += c.montant;
                nbPaye++;
            }
            else if (c.statut === 'PARTIEL') {
                const verse = c.montantVerse ?? 0;
                totalEncaisse += verse;
                totalRestant += c.montant - verse;
                nbPartiel++;
            }
            else {
                totalRestant += c.montant;
                nbImpaye++;
            }
        }
        return {
            saison,
            totalAttendu: Math.round(totalAttendu * 100) / 100,
            totalEncaisse: Math.round(totalEncaisse * 100) / 100,
            totalRestant: Math.round(totalRestant * 100) / 100,
            nbTotal: cotisations.length,
            nbPaye,
            nbImpaye,
            nbPartiel,
        };
    }
    async exportCsv(clubId, saison, currentUser) {
        const role = await this.clubsService.getRoleInClub(clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut exporter les cotisations');
        }
        const cotisations = await this.prisma.cotisation.findMany({
            where: { saison, adherent: { clubId } },
            include: { adherent: true },
            orderBy: { adherent: { lastName: 'asc' } },
        });
        const lignes = ['Nom;Prenom;Montant;MontantVerse;Statut;MoyenPaiement;DatePaiement;Echeance'];
        for (const c of cotisations) {
            const ligne = [
                c.adherent.lastName,
                c.adherent.firstName,
                c.montant.toFixed(2),
                (c.montantVerse ?? '').toString(),
                c.statut,
                c.moyenPaiement ?? '',
                c.datePaiement ? c.datePaiement.toISOString().split('T')[0] : '',
                c.echeance ? c.echeance.toISOString().split('T')[0] : '',
            ].join(';');
            lignes.push(ligne);
        }
        return lignes.join('\n');
    }
    async findEcheances(cotisationId, currentUser) {
        const cotisation = await this.prisma.cotisation.findUnique({
            where: { id: cotisationId },
            include: { adherent: true },
        });
        if (!cotisation)
            throw new common_1.NotFoundException("Cotisation introuvable");
        const role = await this.clubsService.getRoleInClub(cotisation.adherent.clubId, currentUser);
        const isOwner = (role === 'ADHERENT' && cotisation.adherent.userId === currentUser.id) ||
            (role === 'TUTEUR' && cotisation.adherent.tuteurId === currentUser.id);
        if (!STAFF_ROLES.includes(role) && !isOwner) {
            throw new common_1.ForbiddenException('Accès refusé à ces échéances');
        }
        return this.prisma.echeancePaiement.findMany({
            where: { cotisationId },
            orderBy: { numero: 'asc' },
        });
    }
    async marquerEcheancePayee(echeanceId, moyenPaiement, currentUser) {
        const echeance = await this.prisma.echeancePaiement.findUnique({
            where: { id: echeanceId },
            include: { cotisation: { include: { adherent: true } } },
        });
        if (!echeance)
            throw new common_1.NotFoundException("Échéance introuvable");
        const role = await this.clubsService.getRoleInClub(echeance.cotisation.adherent.clubId, currentUser);
        if (!STAFF_ROLES.includes(role)) {
            throw new common_1.ForbiddenException('Seul le staff du club peut marquer une échéance payée');
        }
        await this.prisma.echeancePaiement.update({
            where: { id: echeanceId },
            data: { statut: 'PAYE', datePaiement: new Date(), moyenPaiement },
        });
        const toutesEcheances = await this.prisma.echeancePaiement.findMany({
            where: { cotisationId: echeance.cotisationId },
        });
        const toutesPayees = toutesEcheances.every((e) => e.statut === 'PAYE' || e.id === echeanceId);
        const montantVerseTotal = toutesEcheances.reduce((sum, e) => sum + (e.id === echeanceId || e.statut === 'PAYE' ? e.montant : 0), 0);
        await this.prisma.cotisation.update({
            where: { id: echeance.cotisationId },
            data: {
                statut: toutesPayees ? 'PAYE' : 'PARTIEL',
                montantVerse: montantVerseTotal,
                ...(toutesPayees && { datePaiement: new Date() }),
            },
        });
        return { success: true };
    }
};
exports.CotisationsService = CotisationsService;
exports.CotisationsService = CotisationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        clubs_service_1.ClubsService,
        tarifs_service_1.TarifsService])
], CotisationsService);
