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
exports.AdherentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const adherents_service_1 = require("./adherents.service");
const adherent_dto_1 = require("./dto/adherent.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AdherentsController = class AdherentsController {
    adherentsService;
    constructor(adherentsService) {
        this.adherentsService = adherentsService;
    }
    create(clubId, dto, user) {
        return this.adherentsService.create(clubId, dto, user);
    }
    createDraft(clubId, dto, user) {
        return this.adherentsService.createDraft(clubId, dto, user);
    }
    saveDraft(id, dto, user) {
        return this.adherentsService.saveDraft(id, dto, user);
    }
    findAll(clubId, user) {
        return this.adherentsService.findAll(clubId, user);
    }
    findOne(id, user) {
        return this.adherentsService.findOne(id, user);
    }
    update(id, dto, user) {
        return this.adherentsService.update(id, dto, user);
    }
    updateStatus(id, dto, user) {
        return this.adherentsService.updateStatus(id, dto, user);
    }
    remove(id, user) {
        return this.adherentsService.remove(id, user);
    }
};
exports.AdherentsController = AdherentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, adherent_dto_1.CreateAdherentDto, Object]),
    __metadata("design:returntype", void 0)
], AdherentsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('draft'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, adherent_dto_1.DraftAdherentDto, Object]),
    __metadata("design:returntype", void 0)
], AdherentsController.prototype, "createDraft", null);
__decorate([
    (0, common_1.Patch)(':id/draft'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, adherent_dto_1.DraftAdherentDto, Object]),
    __metadata("design:returntype", void 0)
], AdherentsController.prototype, "saveDraft", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdherentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdherentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, adherent_dto_1.UpdateAdherentDto, Object]),
    __metadata("design:returntype", void 0)
], AdherentsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, adherent_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", void 0)
], AdherentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdherentsController.prototype, "remove", null);
exports.AdherentsController = AdherentsController = __decorate([
    (0, swagger_1.ApiTags)('adherents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('clubs/:clubId/adherents'),
    __metadata("design:paramtypes", [adherents_service_1.AdherentsService])
], AdherentsController);
