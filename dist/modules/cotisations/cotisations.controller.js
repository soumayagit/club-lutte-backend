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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CotisationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cotisations_service_1 = require("./cotisations.service");
const cotisation_dto_1 = require("./dto/cotisation.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CotisationsController = class CotisationsController {
    cotisationsService;
    constructor(cotisationsService) {
        this.cotisationsService = cotisationsService;
    }
    create(adherentId, dto, user) {
        return this.cotisationsService.create(adherentId, dto, user);
    }
    findByClub(clubId, saison, user) {
        return this.cotisationsService.findByClub(clubId, saison, user);
    }
    findMine(adherentId, saison, user) {
        return this.cotisationsService.findMine(adherentId, saison, user);
    }
    update(cotisationId, dto, user) {
        return this.cotisationsService.update(cotisationId, dto, user);
    }
    generateForClub(clubId, saison, echeance, nombreEcheances, user) {
        return this.cotisationsService.generateForClub(clubId, saison, user, echeance, nombreEcheances || 1);
    }
    findEcheances(cotisationId, user) {
        return this.cotisationsService.findEcheances(cotisationId, user);
    }
    marquerEcheancePayee(echeanceId, moyenPaiement, user) {
        return this.cotisationsService.marquerEcheancePayee(echeanceId, moyenPaiement, user);
    }
    getTableauFinancier(clubId, saison, user) {
        return this.cotisationsService.getTableauFinancier(clubId, saison, user);
    }
    async exportCsv(clubId, saison, user, res) {
        const csv = await this.cotisationsService.exportCsv(clubId, saison, user);
        res.set({
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="cotisations.csv"',
        });
        res.send('\uFEFF' + csv);
    }
    async downloadRecu(cotisationId, user, res) {
        const buffer = await this.cotisationsService.generateRecu(cotisationId, user);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="recu.pdf"',
        });
        res.send(buffer);
    }
};
exports.CotisationsController = CotisationsController;
__decorate([
    (0, common_1.Post)('adherents/:adherentId/cotisations'),
    __param(0, (0, common_1.Param)('adherentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cotisation_dto_1.CreateCotisationDto, Object]),
    __metadata("design:returntype", void 0)
], CotisationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('clubs/:clubId/cotisations'),
    (0, swagger_1.ApiQuery)({ name: 'saison', example: '2025-2026' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Query)('saison')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CotisationsController.prototype, "findByClub", null);
__decorate([
    (0, common_1.Get)('adherents/:adherentId/cotisations/mine'),
    (0, swagger_1.ApiQuery)({ name: 'saison', example: '2025-2026' }),
    __param(0, (0, common_1.Param)('adherentId')),
    __param(1, (0, common_1.Query)('saison')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CotisationsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Patch)('cotisations/:cotisationId'),
    __param(0, (0, common_1.Param)('cotisationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cotisation_dto_1.UpdateCotisationDto, Object]),
    __metadata("design:returntype", void 0)
], CotisationsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('clubs/:clubId/cotisations/generate'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Body)('saison')),
    __param(2, (0, common_1.Body)('echeance')),
    __param(3, (0, common_1.Body)('nombreEcheances')),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Object]),
    __metadata("design:returntype", void 0)
], CotisationsController.prototype, "generateForClub", null);
__decorate([
    (0, common_1.Get)('cotisations/:cotisationId/echeances'),
    __param(0, (0, common_1.Param)('cotisationId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CotisationsController.prototype, "findEcheances", null);
__decorate([
    (0, common_1.Patch)('echeances/:echeanceId/payer'),
    __param(0, (0, common_1.Param)('echeanceId')),
    __param(1, (0, common_1.Body)('moyenPaiement')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CotisationsController.prototype, "marquerEcheancePayee", null);
__decorate([
    (0, common_1.Get)('clubs/:clubId/cotisations/tableau'),
    (0, swagger_1.ApiQuery)({ name: 'saison', example: '2025-2026' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Query)('saison')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CotisationsController.prototype, "getTableauFinancier", null);
__decorate([
    (0, common_1.Get)('clubs/:clubId/cotisations/export/csv'),
    (0, swagger_1.ApiQuery)({ name: 'saison', example: '2025-2026' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Query)('saison')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], CotisationsController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('cotisations/:cotisationId/recu'),
    __param(0, (0, common_1.Param)('cotisationId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CotisationsController.prototype, "downloadRecu", null);
exports.CotisationsController = CotisationsController = __decorate([
    (0, swagger_1.ApiTags)('cotisations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [cotisations_service_1.CotisationsService])
], CotisationsController);
