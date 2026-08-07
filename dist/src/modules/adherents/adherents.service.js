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
exports.AdherentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];
let AdherentsService = class AdherentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    computeIsMinor(birthDate) {
        const age = (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return age < 18;
    }
    handlePrismaError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                const target = error.meta?.target ?? [];
                if (target.includes('licenceFFLDA')) {
                    throw new common_1.ConflictException('Ce numéro de licence FFLDA est déjà utilisé par un autre adhérent');
                }
                throw new common_1.ConflictException('Une valeur unique est déjà utilisée par un autre enregistrement');
            }
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Adhérent introuvable');
            }
        }
        throw error;
    }
    async create(dto, currentUser) {
        const birthDate = new Date(dto.birthDate);
        const isMinor = this.computeIsMinor(birthDate);
        let userId;
        let tuteurId;
        if (STAFF_ROLES.includes(currentUser.role)) {
            tuteurId = dto.tuteurId;
        }
        else if (currentUser.role === 'TUTEUR') {
            if (!isMinor) {
                throw new common_1.BadRequestException('Un tuteur ne peut créer que des fiches d\'adhérents mineurs');
            }
            tuteurId = currentUser.id;
        }
        else if (currentUser.role === 'ADHERENT') {
            if (isMinor) {
                throw new common_1.BadRequestException('Un compte adhérent majeur ne peut pas créer de fiche mineure — un tuteur doit s\'en charger');
            }
            const existing = await this.prisma.adherent.findUnique({ where: { userId: currentUser.id } });
            if (existing) {
                throw new common_1.BadRequestException('Une fiche adhérent existe déjà pour ce compte');
            }
            userId = currentUser.id;
        }
        try {
            return await this.prisma.adherent.create({
                data: {
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    birthDate,
                    isMinor,
                    ageCategory: dto.ageCategory,
                    weightKg: dto.weightKg,
                    licenceFFLDA: dto.licenceFFLDA,
                    userId,
                    tuteurId,
                    status: 'DRAFT',
                },
            });
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    async createDraft(dto, currentUser) {
        let userId;
        let tuteurId;
        if (currentUser.role === 'TUTEUR') {
            tuteurId = currentUser.id;
        }
        else if (currentUser.role === 'ADHERENT') {
            const existing = await this.prisma.adherent.findUnique({ where: { userId: currentUser.id } });
            if (existing) {
                throw new common_1.BadRequestException('Une fiche adhérent existe déjà pour ce compte');
            }
            userId = currentUser.id;
        }
        const birthDate = dto.birthDate ? new Date(dto.birthDate) : undefined;
        try {
            return await this.prisma.adherent.create({
                data: {
                    firstName: dto.firstName ?? '',
                    lastName: dto.lastName ?? '',
                    birthDate: birthDate ?? new Date('1900-01-01'),
                    isMinor: birthDate ? this.computeIsMinor(birthDate) : false,
                    ageCategory: dto.ageCategory,
                    weightKg: dto.weightKg,
                    licenceFFLDA: dto.licenceFFLDA,
                    userId,
                    tuteurId,
                    status: 'DRAFT',
                },
            });
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    async saveDraft(id, dto, currentUser) {
        const adherent = await this.prisma.adherent.findUnique({ where: { id } });
        if (!adherent) {
            throw new common_1.NotFoundException('Adhérent introuvable');
        }
        if (adherent.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Ce dossier n\'est plus au stade brouillon, utilise la mise à jour normale');
        }
        this.assertOwnership(adherent, currentUser);
        const data = { ...dto };
        if (dto.birthDate) {
            data.birthDate = new Date(dto.birthDate);
            data.isMinor = this.computeIsMinor(data.birthDate);
        }
        try {
            return await this.prisma.adherent.update({ where: { id }, data });
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    async findAll(currentUser) {
        if (STAFF_ROLES.includes(currentUser.role)) {
            return this.prisma.adherent.findMany({ orderBy: { createdAt: 'desc' } });
        }
        if (currentUser.role === 'TUTEUR') {
            return this.prisma.adherent.findMany({
                where: { tuteurId: currentUser.id },
                orderBy: { createdAt: 'desc' },
            });
        }
        return this.prisma.adherent.findMany({
            where: { userId: currentUser.id },
        });
    }
    async findOne(id, currentUser) {
        const adherent = await this.prisma.adherent.findUnique({ where: { id } });
        if (!adherent) {
            throw new common_1.NotFoundException('Adhérent introuvable');
        }
        this.assertOwnership(adherent, currentUser);
        return adherent;
    }
    async update(id, dto, currentUser) {
        const adherent = await this.prisma.adherent.findUnique({ where: { id } });
        if (!adherent) {
            throw new common_1.NotFoundException('Adhérent introuvable');
        }
        this.assertOwnership(adherent, currentUser);
        const data = { ...dto };
        if (dto.birthDate) {
            data.birthDate = new Date(dto.birthDate);
            data.isMinor = this.computeIsMinor(data.birthDate);
        }
        try {
            return await this.prisma.adherent.update({ where: { id }, data });
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    async updateStatus(id, dto, currentUser) {
        if (!STAFF_ROLES.includes(currentUser.role)) {
            throw new common_1.ForbiddenException('Seul le bureau peut modifier le statut d\'un dossier');
        }
        const adherent = await this.prisma.adherent.findUnique({ where: { id } });
        if (!adherent) {
            throw new common_1.NotFoundException('Adhérent introuvable');
        }
        return this.prisma.adherent.update({ where: { id }, data: { status: dto.status } });
    }
    async remove(id, currentUser) {
        if (!STAFF_ROLES.includes(currentUser.role)) {
            throw new common_1.ForbiddenException('Seul le bureau peut supprimer une fiche adhérent');
        }
        const adherent = await this.prisma.adherent.findUnique({ where: { id } });
        if (!adherent) {
            throw new common_1.NotFoundException('Adhérent introuvable');
        }
        return this.prisma.adherent.update({ where: { id }, data: { status: 'ARCHIVED' } });
    }
    assertOwnership(adherent, currentUser) {
        if (STAFF_ROLES.includes(currentUser.role))
            return;
        if (currentUser.role === 'TUTEUR' && adherent.tuteurId === currentUser.id)
            return;
        if (currentUser.role === 'ADHERENT' && adherent.userId === currentUser.id)
            return;
        throw new common_1.ForbiddenException('Accès refusé à cette fiche adhérent');
    }
};
exports.AdherentsService = AdherentsService;
exports.AdherentsService = AdherentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdherentsService);
//# sourceMappingURL=adherents.service.js.map