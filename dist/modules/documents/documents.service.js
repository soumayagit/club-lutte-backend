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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const clubs_service_1 = require("../clubs/clubs.service");
const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];
let DocumentsService = class DocumentsService {
    prisma;
    clubsService;
    constructor(prisma, clubsService) {
        this.prisma = prisma;
        this.clubsService = clubsService;
    }
    async assertAccessToAdherent(adherentId, currentUser) {
        const adherent = await this.prisma.adherent.findUnique({ where: { id: adherentId } });
        if (!adherent) {
            throw new common_1.NotFoundException('Adhérent introuvable');
        }
        const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
        if (STAFF_ROLES.includes(roleInClub))
            return adherent;
        if (roleInClub === 'TUTEUR' && adherent.tuteurId === currentUser.id)
            return adherent;
        if (roleInClub === 'ADHERENT' && adherent.userId === currentUser.id)
            return adherent;
        throw new common_1.ForbiddenException('Accès refusé à cette fiche adhérent');
    }
    async upload(adherentId, type, fileUrl, extractedData, currentUser) {
        await this.assertAccessToAdherent(adherentId, currentUser);
        let parsedData = null;
        if (extractedData) {
            try {
                parsedData = JSON.parse(extractedData);
            }
            catch {
                parsedData = null;
            }
        }
        return this.prisma.document.create({
            data: {
                adherentId,
                type,
                fileUrl,
                extractedData: parsedData,
                status: 'PENDING',
            },
        });
    }
    async findByAdherent(adherentId, currentUser) {
        await this.assertAccessToAdherent(adherentId, currentUser);
        return this.prisma.document.findMany({
            where: { adherentId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(documentId, status, currentUser) {
        const document = await this.prisma.document.findUnique({ where: { id: documentId } });
        if (!document) {
            throw new common_1.NotFoundException('Document introuvable');
        }
        const adherent = await this.prisma.adherent.findUnique({ where: { id: document.adherentId } });
        if (!adherent) {
            throw new common_1.NotFoundException('Adhérent introuvable');
        }
        const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
        if (!STAFF_ROLES.includes(roleInClub)) {
            throw new common_1.ForbiddenException('Seul le bureau peut valider/refuser un document');
        }
        return this.prisma.document.update({ where: { id: documentId }, data: { status } });
    }
    async remove(documentId, currentUser) {
        const document = await this.prisma.document.findUnique({ where: { id: documentId } });
        if (!document) {
            throw new common_1.NotFoundException('Document introuvable');
        }
        await this.assertAccessToAdherent(document.adherentId, currentUser);
        return this.prisma.document.delete({ where: { id: documentId } });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        clubs_service_1.ClubsService])
], DocumentsService);
