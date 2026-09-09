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
exports.DeplacementsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const deplacements_service_1 = require("./deplacements.service");
const deplacement_dto_1 = require("./dto/deplacement.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let DeplacementsController = class DeplacementsController {
    deplacementsService;
    constructor(deplacementsService) {
        this.deplacementsService = deplacementsService;
    }
    create(clubId, dto, user) {
        return this.deplacementsService.create(clubId, dto, user);
    }
    findByClub(clubId, user) {
        return this.deplacementsService.findByClub(clubId, user);
    }
    update(deplacementId, dto, user) {
        return this.deplacementsService.update(deplacementId, dto, user);
    }
    addParticipants(deplacementId, dto, user) {
        return this.deplacementsService.addParticipants(deplacementId, dto, user);
    }
    proposerVehicule(deplacementId, dto, user) {
        return this.deplacementsService.proposerVehicule(deplacementId, dto, user);
    }
    findVehicules(deplacementId, user) {
        return this.deplacementsService.findVehicules(deplacementId, user);
    }
    affecterPassager(vehiculeId, dto, user) {
        return this.deplacementsService.affecterPassager(vehiculeId, dto, user);
    }
    retirerPassager(passagerId, user) {
        return this.deplacementsService.retirerPassager(passagerId, user);
    }
    validerAutorisation(passagerId, dto, user) {
        return this.deplacementsService.validerAutorisation(passagerId, dto, user);
    }
    validerPlanTransport(deplacementId, user) {
        return this.deplacementsService.validerPlanTransport(deplacementId, user);
    }
};
exports.DeplacementsController = DeplacementsController;
__decorate([
    (0, common_1.Post)('clubs/:clubId/deplacements'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deplacement_dto_1.CreateDeplacementDto, Object]),
    __metadata("design:returntype", void 0)
], DeplacementsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('clubs/:clubId/deplacements'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DeplacementsController.prototype, "findByClub", null);
__decorate([
    (0, common_1.Patch)('deplacements/:deplacementId'),
    __param(0, (0, common_1.Param)('deplacementId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deplacement_dto_1.UpdateDeplacementDto, Object]),
    __metadata("design:returntype", void 0)
], DeplacementsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('deplacements/:deplacementId/participants'),
    __param(0, (0, common_1.Param)('deplacementId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deplacement_dto_1.AddParticipantsDto, Object]),
    __metadata("design:returntype", void 0)
], DeplacementsController.prototype, "addParticipants", null);
__decorate([
    (0, common_1.Post)('deplacements/:deplacementId/vehicules'),
    __param(0, (0, common_1.Param)('deplacementId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deplacement_dto_1.ProposerVehiculeDto, Object]),
    __metadata("design:returntype", void 0)
], DeplacementsController.prototype, "proposerVehicule", null);
__decorate([
    (0, common_1.Get)('deplacements/:deplacementId/vehicules'),
    __param(0, (0, common_1.Param)('deplacementId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DeplacementsController.prototype, "findVehicules", null);
__decorate([
    (0, common_1.Post)('vehicules/:vehiculeId/passagers'),
    __param(0, (0, common_1.Param)('vehiculeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deplacement_dto_1.AffecterPassagerDto, Object]),
    __metadata("design:returntype", void 0)
], DeplacementsController.prototype, "affecterPassager", null);
__decorate([
    (0, common_1.Delete)('passagers/:passagerId'),
    __param(0, (0, common_1.Param)('passagerId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DeplacementsController.prototype, "retirerPassager", null);
__decorate([
    (0, common_1.Patch)('passagers/:passagerId/autorisation'),
    __param(0, (0, common_1.Param)('passagerId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deplacement_dto_1.ValiderAutorisationDto, Object]),
    __metadata("design:returntype", void 0)
], DeplacementsController.prototype, "validerAutorisation", null);
__decorate([
    (0, common_1.Post)('deplacements/:deplacementId/valider-transport'),
    __param(0, (0, common_1.Param)('deplacementId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DeplacementsController.prototype, "validerPlanTransport", null);
exports.DeplacementsController = DeplacementsController = __decorate([
    (0, swagger_1.ApiTags)('deplacements'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [deplacements_service_1.DeplacementsService])
], DeplacementsController);
