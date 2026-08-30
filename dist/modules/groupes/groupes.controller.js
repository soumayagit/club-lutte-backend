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
exports.GroupesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const groupes_service_1 = require("./groupes.service");
const groupe_dto_1 = require("./dto/groupe.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let GroupesController = class GroupesController {
    groupesService;
    constructor(groupesService) {
        this.groupesService = groupesService;
    }
    create(clubId, dto, user) {
        return this.groupesService.create(clubId, dto, user);
    }
    findByClub(clubId, user) {
        return this.groupesService.findByClub(clubId, user);
    }
    findOne(groupeId, user) {
        return this.groupesService.findOne(groupeId, user);
    }
    update(groupeId, dto, user) {
        return this.groupesService.update(groupeId, dto, user);
    }
    remove(groupeId, user) {
        return this.groupesService.remove(groupeId, user);
    }
    addMembre(groupeId, adherentId, user) {
        return this.groupesService.addMembre(groupeId, adherentId, user);
    }
    removeMembre(groupeId, adherentId, user) {
        return this.groupesService.removeMembre(groupeId, adherentId, user);
    }
    addEntraineur(groupeId, userId, user) {
        return this.groupesService.addEntraineur(groupeId, userId, user);
    }
    addCreneau(groupeId, dto, user) {
        return this.groupesService.addCreneau(groupeId, dto, user);
    }
    removeCreneau(creneauId, user) {
        return this.groupesService.removeCreneau(creneauId, user);
    }
};
exports.GroupesController = GroupesController;
__decorate([
    (0, common_1.Post)('clubs/:clubId/groupes'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, groupe_dto_1.CreateGroupeDto, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('clubs/:clubId/groupes'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "findByClub", null);
__decorate([
    (0, common_1.Get)('groupes/:groupeId'),
    __param(0, (0, common_1.Param)('groupeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('groupes/:groupeId'),
    __param(0, (0, common_1.Param)('groupeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, groupe_dto_1.UpdateGroupeDto, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('groupes/:groupeId'),
    __param(0, (0, common_1.Param)('groupeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('groupes/:groupeId/membres/:adherentId'),
    __param(0, (0, common_1.Param)('groupeId')),
    __param(1, (0, common_1.Param)('adherentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "addMembre", null);
__decorate([
    (0, common_1.Delete)('groupes/:groupeId/membres/:adherentId'),
    __param(0, (0, common_1.Param)('groupeId')),
    __param(1, (0, common_1.Param)('adherentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "removeMembre", null);
__decorate([
    (0, common_1.Post)('groupes/:groupeId/entraineurs/:userId'),
    __param(0, (0, common_1.Param)('groupeId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "addEntraineur", null);
__decorate([
    (0, common_1.Post)('groupes/:groupeId/creneaux'),
    __param(0, (0, common_1.Param)('groupeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, groupe_dto_1.CreateCreneauDto, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "addCreneau", null);
__decorate([
    (0, common_1.Delete)('creneaux/:creneauId'),
    __param(0, (0, common_1.Param)('creneauId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "removeCreneau", null);
exports.GroupesController = GroupesController = __decorate([
    (0, swagger_1.ApiTags)('groupes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [groupes_service_1.GroupesService])
], GroupesController);
