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
const clubs_service_1 = require("../clubs/clubs.service");
const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];
let AdherentsService = class AdherentsService {
    prisma;
    clubsService;
    constructor(prisma, clubsService) {
        this.prisma = prisma;
        this.clubsService = clubsService;
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
                    throw new common_1.ConflictException('Ce numéro de licence FFLDA est déjà utilisé dans ce club');
                }
                throw new common_1.ConflictException('Une valeur unique est déjà utilisée par un autre enregistrement');
            }
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Adhérent introuvable');
            }
        }
        throw error;
    }
    async create(clubId, dto, currentUser) {
        const roleInClub = await this.clubsService.getRoleInClub(clubId, currentUser);
        const birthDate = new Date(dto.birthDate);
        const isMinor = this.computeIsMinor(birthDate);
        let userId;
        let tuteurId;
        if (STAFF_ROLES.includes(roleInClub)) {
            tuteurId = dto.tuteurId;
        }
        else if (roleInClub === 'TUTEUR') {
            if (!isMinor) {
                throw new common_1.BadRequestException('Un tuteur ne peut créer que des fiches d\'adhérents mineurs');
            }
            tuteurId = currentUser.id;
        }
        else if (roleInClub === 'ADHERENT') {
            if (isMinor) {
                throw new common_1.BadRequestException('Un compte adhérent majeur ne peut pas créer de fiche mineure — un tuteur doit s\'en charger');
            }
            const existing = await this.prisma.adherent.findFirst({
                where: { userId: currentUser.id, clubId },
            });
            if (existing) {
                throw new common_1.BadRequestException('Une fiche adhérent existe déjà pour ce compte dans ce club');
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
                    clubId,
                    status: 'SUBMITTED',
                },
            });
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    async createDraft(clubId, dto, currentUser) {
        await this.clubsService.assertMembership(clubId, currentUser);
        const roleInClub = await this.clubsService.getRoleInClub(clubId, currentUser);
        let userId;
        let tuteurId;
        if (roleInClub === 'TUTEUR') {
            tuteurId = currentUser.id;
        }
        else if (roleInClub === 'ADHERENT') {
            const existing = await this.prisma.adherent.findFirst({
                where: { userId: currentUser.id, clubId },
            });
            if (existing) {
                throw new common_1.BadRequestException('Une fiche adhérent existe déjà pour ce compte dans ce club');
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
                    clubId,
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
        await this.assertOwnership(adherent, currentUser);
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
    async findAll(clubId, currentUser) {
        const roleInClub = await this.clubsService.getRoleInClub(clubId, currentUser);
        if (STAFF_ROLES.includes(roleInClub)) {
            return this.prisma.adherent.findMany({
                where: { clubId },
                orderBy: { createdAt: 'desc' },
            });
        }
        if (roleInClub === 'TUTEUR') {
            return this.prisma.adherent.findMany({
                where: { clubId, tuteurId: currentUser.id },
                orderBy: { createdAt: 'desc' },
            });
        }
        return this.prisma.adherent.findMany({
            where: { clubId, userId: currentUser.id },
        });
    }
    async findOne(id, currentUser) {
        const adherent = await this.prisma.adherent.findUnique({ where: { id } });
        if (!adherent) {
            throw new common_1.NotFoundException('Adhérent introuvable');
        }
        await this.assertOwnership(adherent, currentUser);
        return adherent;
    }
    async update(id, dto, currentUser) {
        const adherent = await this.prisma.adherent.findUnique({ where: { id } });
        if (!adherent) {
            throw new common_1.NotFoundException('Adhérent introuvable');
        }
        await this.assertOwnership(adherent, currentUser);
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
        const adherent = await this.prisma.adherent.findUnique({ where: { id } });
        if (!adherent) {
            throw new common_1.NotFoundException('Adhérent introuvable');
        }
        const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
        const isOwner = (roleInClub === 'ADHERENT' && adherent.userId === currentUser.id) ||
            (roleInClub === 'TUTEUR' && adherent.tuteurId === currentUser.id);
        const isSelfSubmit = isOwner && adherent.status === 'DRAFT' && dto.status === 'SUBMITTED';
        if (!STAFF_ROLES.includes(roleInClub) && !isSelfSubmit) {
            throw new common_1.ForbiddenException('Seul le bureau peut modifier le statut d\'un dossier');
        }
        return this.prisma.adherent.update({ where: { id }, data: { status: dto.status } });
    }
    async remove(id, currentUser) {
        const adherent = await this.prisma.adherent.findUnique({ where: { id } });
        if (!adherent) {
            throw new common_1.NotFoundException('Adhérent introuvable');
        }
        const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
        if (!STAFF_ROLES.includes(roleInClub)) {
            throw new common_1.ForbiddenException('Seul le bureau peut supprimer une fiche adhérent');
        }
        return this.prisma.adherent.update({ where: { id }, data: { status: 'ARCHIVED' } });
    }
    async assertOwnership(adherent, currentUser) {
        const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
        if (STAFF_ROLES.includes(roleInClub))
            return;
        if (roleInClub === 'TUTEUR' && adherent.tuteurId === currentUser.id)
            return;
        if (roleInClub === 'ADHERENT' && adherent.userId === currentUser.id)
            return;
        throw new common_1.ForbiddenException('Accès refusé à cette fiche adhérent');
    }
    async exportPdf(clubId, currentUser) {
        const roleInClub = await this.clubsService.getRoleInClub(clubId, currentUser);
        if (!STAFF_ROLES.includes(roleInClub)) {
            throw new common_1.ForbiddenException("Seul le staff peut exporter la liste des adhérents");
        }
        const club = await this.prisma.club.findUnique({ where: { id: clubId } });
        const adherentsList = await this.prisma.adherent.findMany({
            where: { clubId, status: { not: 'ARCHIVED' } },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        });
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        const donePromise = new Promise((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });
        doc.fontSize(18).font('Helvetica-Bold').text(club?.nom ?? 'Club', { align: 'center' });
        doc.fontSize(10).font('Helvetica').fillColor('#666')
            .text(`Liste des adhérents — ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
        doc.moveDown(1.5);
        const colX = { nom: 40, prenom: 160, naissance: 280, categorie: 370, licence: 470 };
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#000');
        doc.text('Nom', colX.nom, doc.y, { continued: false });
        doc.text('Prénom', colX.prenom, doc.y - doc.currentLineHeight());
        doc.text('Naissance', colX.naissance, doc.y - doc.currentLineHeight());
        doc.text('Catégorie', colX.categorie, doc.y - doc.currentLineHeight());
        doc.text('Licence', colX.licence, doc.y - doc.currentLineHeight());
        doc.moveDown(0.5);
        doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#ccc').stroke();
        doc.moveDown(0.3);
        doc.font('Helvetica').fontSize(9);
        for (const a of adherentsList) {
            const y = doc.y;
            doc.text(a.lastName, colX.nom, y, { width: 110 });
            doc.text(a.firstName, colX.prenom, y, { width: 110 });
            doc.text(a.birthDate.toLocaleDateString('fr-FR'), colX.naissance, y, { width: 80 });
            doc.text(a.ageCategory ?? '—', colX.categorie, y, { width: 90 });
            doc.text(a.licenceFFLDA ?? '—', colX.licence, y, { width: 80 });
            doc.moveDown(0.6);
            if (doc.y > 760)
                doc.addPage();
        }
        doc.end();
        return donePromise;
    }
    async exportExcel(clubId, currentUser) {
        const roleInClub = await this.clubsService.getRoleInClub(clubId, currentUser);
        if (!STAFF_ROLES.includes(roleInClub)) {
            throw new common_1.ForbiddenException("Seul le staff peut exporter la liste des adhérents");
        }
        const club = await this.prisma.club.findUnique({ where: { id: clubId } });
        const adherentsList = await this.prisma.adherent.findMany({
            where: { clubId, status: { not: 'ARCHIVED' } },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        });
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Adhérents');
        sheet.columns = [
            { header: 'Nom', key: 'lastName', width: 20 },
            { header: 'Prénom', key: 'firstName', width: 20 },
            { header: 'Date de naissance', key: 'birthDate', width: 18 },
            { header: 'Catégorie', key: 'ageCategory', width: 15 },
            { header: 'N° Licence FFLDA', key: 'licenceFFLDA', width: 18 },
            { header: 'Statut', key: 'status', width: 14 },
        ];
        sheet.getRow(1).font = { bold: true };
        for (const a of adherentsList) {
            sheet.addRow({
                lastName: a.lastName,
                firstName: a.firstName,
                birthDate: a.birthDate.toLocaleDateString('fr-FR'),
                ageCategory: a.ageCategory ?? '—',
                licenceFFLDA: a.licenceFFLDA ?? '—',
                status: a.status,
            });
        }
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
};
exports.AdherentsService = AdherentsService;
exports.AdherentsService = AdherentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        clubs_service_1.ClubsService])
], AdherentsService);
