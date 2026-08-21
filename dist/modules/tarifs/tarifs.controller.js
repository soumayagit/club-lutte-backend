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
exports.TarifsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tarifs_service_1 = require("./tarifs.service");
const tarif_dto_1 = require("./dto/tarif.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let TarifsController = class TarifsController {
    tarifsService;
    constructor(tarifsService) {
        this.tarifsService = tarifsService;
    }
    setTarif(clubId, dto, user) {
        return this.tarifsService.setTarif(clubId, dto, user);
    }
    findTarifs(clubId, saison, user) {
        return this.tarifsService.findTarifs(clubId, saison, user);
    }
    deleteTarif(tarifId, user) {
        return this.tarifsService.deleteTarif(tarifId, user);
    }
    createCodePromo(clubId, dto, user) {
        return this.tarifsService.createCodePromo(clubId, dto, user);
    }
    findCodesPromo(clubId, user) {
        return this.tarifsService.findCodesPromo(clubId, user);
    }
    updateCodePromo(codePromoId, dto, user) {
        return this.tarifsService.updateCodePromo(codePromoId, dto, user);
    }
    simulate(clubId, adherentId, saison, codePromo, user) {
        return this.tarifsService.calculerMontant({ clubId, saison, adherentId, codePromo });
    }
};
exports.TarifsController = TarifsController;
__decorate([
    (0, common_1.Post)('tarifs'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tarif_dto_1.SetTarifDto, Object]),
    __metadata("design:returntype", void 0)
], TarifsController.prototype, "setTarif", null);
__decorate([
    (0, common_1.Get)('tarifs'),
    (0, swagger_1.ApiQuery)({ name: 'saison', example: '2025-2026' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Query)('saison')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TarifsController.prototype, "findTarifs", null);
__decorate([
    (0, common_1.Delete)('tarifs/:tarifId'),
    __param(0, (0, common_1.Param)('tarifId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TarifsController.prototype, "deleteTarif", null);
__decorate([
    (0, common_1.Post)('codes-promo'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tarif_dto_1.CreateCodePromoDto, Object]),
    __metadata("design:returntype", void 0)
], TarifsController.prototype, "createCodePromo", null);
__decorate([
    (0, common_1.Get)('codes-promo'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TarifsController.prototype, "findCodesPromo", null);
__decorate([
    (0, common_1.Patch)('codes-promo/:codePromoId'),
    __param(0, (0, common_1.Param)('codePromoId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tarif_dto_1.UpdateCodePromoDto, Object]),
    __metadata("design:returntype", void 0)
], TarifsController.prototype, "updateCodePromo", null);
__decorate([
    (0, common_1.Get)('tarifs/simulate/:adherentId'),
    (0, swagger_1.ApiQuery)({ name: 'saison', example: '2025-2026' }),
    (0, swagger_1.ApiQuery)({ name: 'codePromo', required: false, example: 'FAMILLE2026' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('adherentId')),
    __param(2, (0, common_1.Query)('saison')),
    __param(3, (0, common_1.Query)('codePromo')),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], TarifsController.prototype, "simulate", null);
exports.TarifsController = TarifsController = __decorate([
    (0, swagger_1.ApiTags)('tarifs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('clubs/:clubId'),
    __metadata("design:paramtypes", [tarifs_service_1.TarifsService])
], TarifsController);
