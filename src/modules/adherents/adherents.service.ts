import { Injectable, ForbiddenException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubsService } from '../clubs/clubs.service';
import { CreateAdherentDto, UpdateAdherentDto, UpdateStatusDto, DraftAdherentDto } from './dto/adherent.dto';

interface CurrentUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];

@Injectable()
export class AdherentsService {
  constructor(
    private prisma: PrismaService,
    private clubsService: ClubsService,
  ) {}

  private computeIsMinor(birthDate: Date): boolean {
    const age = (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age < 18;
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[] | undefined) ?? [];
        if (target.includes('licenceFFLDA')) {
          throw new ConflictException('Ce numéro de licence FFLDA est déjà utilisé dans ce club');
        }
        throw new ConflictException('Une valeur unique est déjà utilisée par un autre enregistrement');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Adhérent introuvable');
      }
    }
    throw error;
  }

  // ── Toutes les méthodes prennent maintenant clubId + vérifient le rôle DANS ce club ──

  async create(clubId: string, dto: CreateAdherentDto, currentUser: CurrentUser) {
    const roleInClub = await this.clubsService.getRoleInClub(clubId, currentUser);
    const birthDate = new Date(dto.birthDate);
    const isMinor = this.computeIsMinor(birthDate);

    let userId: string | undefined;
    let tuteurId: string | undefined;

    if (STAFF_ROLES.includes(roleInClub)) {
      tuteurId = dto.tuteurId;
    } else if (roleInClub === 'TUTEUR') {
      if (!isMinor) {
        throw new BadRequestException('Un tuteur ne peut créer que des fiches d\'adhérents mineurs');
      }
      tuteurId = currentUser.id;
    } else if (roleInClub === 'ADHERENT') {
      if (isMinor) {
        throw new BadRequestException('Un compte adhérent majeur ne peut pas créer de fiche mineure — un tuteur doit s\'en charger');
      }
      // Un même compte peut être adhérent dans PLUSIEURS clubs différents,
      // donc on vérifie l'unicité seulement DANS ce club précis.
      const existing = await this.prisma.adherent.findFirst({
        where: { userId: currentUser.id, clubId },
      });
      if (existing) {
        throw new BadRequestException('Une fiche adhérent existe déjà pour ce compte dans ce club');
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
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async createDraft(clubId: string, dto: DraftAdherentDto, currentUser: CurrentUser) {
    await this.clubsService.assertMembership(clubId, currentUser);
    const roleInClub = await this.clubsService.getRoleInClub(clubId, currentUser);

    let userId: string | undefined;
    let tuteurId: string | undefined;

    if (roleInClub === 'TUTEUR') {
      tuteurId = currentUser.id;
    } else if (roleInClub === 'ADHERENT') {
      const existing = await this.prisma.adherent.findFirst({
        where: { userId: currentUser.id, clubId },
      });
      if (existing) {
        throw new BadRequestException('Une fiche adhérent existe déjà pour ce compte dans ce club');
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
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async saveDraft(id: string, dto: DraftAdherentDto, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    if (adherent.status !== 'DRAFT') {
      throw new BadRequestException('Ce dossier n\'est plus au stade brouillon, utilise la mise à jour normale');
    }
    await this.assertOwnership(adherent, currentUser);

    const data: any = { ...dto };
    if (dto.birthDate) {
      data.birthDate = new Date(dto.birthDate);
      data.isMinor = this.computeIsMinor(data.birthDate);
    }

    try {
      return await this.prisma.adherent.update({ where: { id }, data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(clubId: string, currentUser: CurrentUser) {
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

  async findOne(id: string, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    await this.assertOwnership(adherent, currentUser);
    return adherent;
  }

  async update(id: string, dto: UpdateAdherentDto, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    await this.assertOwnership(adherent, currentUser);

    const data: any = { ...dto };
    if (dto.birthDate) {
      data.birthDate = new Date(dto.birthDate);
      data.isMinor = this.computeIsMinor(data.birthDate);
    }

    try {
      return await this.prisma.adherent.update({ where: { id }, data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateStatus(id: string, dto: UpdateStatusDto, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);

    const isOwner =
      (roleInClub === 'ADHERENT' && adherent.userId === currentUser.id) ||
      (roleInClub === 'TUTEUR' && adherent.tuteurId === currentUser.id);

    // Le propriétaire d'un brouillon peut le SOUMETTRE lui-même (DRAFT → SUBMITTED),
    // mais rien d'autre (pas de validation/refus — ça reste réservé au staff).
    const isSelfSubmit = isOwner && adherent.status === 'DRAFT' && dto.status === 'SUBMITTED';

    if (!STAFF_ROLES.includes(roleInClub) && !isSelfSubmit) {
      throw new ForbiddenException('Seul le bureau peut modifier le statut d\'un dossier');
    }
    return this.prisma.adherent.update({ where: { id }, data: { status: dto.status } });
  }

  async remove(id: string, currentUser: CurrentUser) {
    const adherent = await this.prisma.adherent.findUnique({ where: { id } });
    if (!adherent) {
      throw new NotFoundException('Adhérent introuvable');
    }
    const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
    if (!STAFF_ROLES.includes(roleInClub)) {
      throw new ForbiddenException('Seul le bureau peut supprimer une fiche adhérent');
    }
    return this.prisma.adherent.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  // ── Vérifie l'accès à UNE fiche précise, selon le rôle dans SON club ────────
  private async assertOwnership(
    adherent: { clubId: string; userId: string | null; tuteurId: string | null },
    currentUser: CurrentUser,
  ) {
    const roleInClub = await this.clubsService.getRoleInClub(adherent.clubId, currentUser);
    if (STAFF_ROLES.includes(roleInClub)) return;
    if (roleInClub === 'TUTEUR' && adherent.tuteurId === currentUser.id) return;
    if (roleInClub === 'ADHERENT' && adherent.userId === currentUser.id) return;
    throw new ForbiddenException('Accès refusé à cette fiche adhérent');
  }

  // ── Génère un export PDF de la liste des adhérents du club ──────────────
  async exportPdf(clubId: string, currentUser: CurrentUser): Promise<Buffer> {
    const roleInClub = await this.clubsService.getRoleInClub(clubId, currentUser);
    if (!STAFF_ROLES.includes(roleInClub)) {
      throw new ForbiddenException("Seul le staff peut exporter la liste des adhérents");
    }

    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    const adherentsList = await this.prisma.adherent.findMany({
      where: { clubId, status: { not: 'ARCHIVED' } },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const donePromise = new Promise<Buffer>((resolve) => {
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
      if (doc.y > 760) doc.addPage();
    }

    doc.end();
    return donePromise;
  }

  // ── Génère un export Excel de la liste des adhérents du club ────────────
  async exportExcel(clubId: string, currentUser: CurrentUser): Promise<Buffer> {
    const roleInClub = await this.clubsService.getRoleInClub(clubId, currentUser);
    if (!STAFF_ROLES.includes(roleInClub)) {
      throw new ForbiddenException("Seul le staff peut exporter la liste des adhérents");
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
}