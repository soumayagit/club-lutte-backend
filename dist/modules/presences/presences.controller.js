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
exports.PresencesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const presences_service_1 = require("./presences.service");
const presence_dto_1 = require("./dto/presence.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PresencesController = class PresencesController {
    presencesService;
    constructor(presencesService) {
        this.presencesService = presencesService;
    }
    createSeance(groupeId, dto, user) {
        return this.presencesService.createSeance(groupeId, dto, user);
    }
    findSeancesByGroupe(groupeId, user) {
        return this.presencesService.findSeancesByGroupe(groupeId, user);
    }
    updateSeance(seanceId, dto, user) {
        return this.presencesService.updateSeance(seanceId, dto, user);
    }
    findPresencesBySeance(seanceId, user) {
        return this.presencesService.findPresencesBySeance(seanceId, user);
    }
    marquerPresence(presenceId, dto, user) {
        return this.presencesService.marquerPresence(presenceId, dto, user);
    }
    appelGroupe(seanceId, dto, user) {
        return this.presencesService.appelGroupe(seanceId, dto, user);
    }
    statsAdherent(adherentId, user) {
        return this.presencesService.statsAdherent(adherentId, user);
    }
};
exports.PresencesController = PresencesController;
__decorate([
    (0, common_1.Post)('groupes/:groupeId/seances'),
    __param(0, (0, common_1.Param)('groupeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, presence_dto_1.CreateSeanceDto, Object]),
    __metadata("design:returntype", void 0)
], PresencesController.prototype, "createSeance", null);
__decorate([
    (0, common_1.Get)('groupes/:groupeId/seances'),
    __param(0, (0, common_1.Param)('groupeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PresencesController.prototype, "findSeancesByGroupe", null);
__decorate([
    (0, common_1.Patch)('seances/:seanceId'),
    __param(0, (0, common_1.Param)('seanceId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, presence_dto_1.UpdateSeanceDto, Object]),
    __metadata("design:returntype", void 0)
], PresencesController.prototype, "updateSeance", null);
__decorate([
    (0, common_1.Get)('seances/:seanceId/presences'),
    __param(0, (0, common_1.Param)('seanceId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PresencesController.prototype, "findPresencesBySeance", null);
__decorate([
    (0, common_1.Patch)('presences/:presenceId'),
    __param(0, (0, common_1.Param)('presenceId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, presence_dto_1.MarquerPresenceDto, Object]),
    __metadata("design:returntype", void 0)
], PresencesController.prototype, "marquerPresence", null);
__decorate([
    (0, common_1.Post)('seances/:seanceId/appel'),
    __param(0, (0, common_1.Param)('seanceId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, presence_dto_1.AppelGroupeDto, Object]),
    __metadata("design:returntype", void 0)
], PresencesController.prototype, "appelGroupe", null);
__decorate([
    (0, common_1.Get)('adherents/:adherentId/presences/stats'),
    __param(0, (0, common_1.Param)('adherentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PresencesController.prototype, "statsAdherent", null);
exports.PresencesController = PresencesController = __decorate([
    (0, swagger_1.ApiTags)('presences'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [presences_service_1.PresencesService])
], PresencesController);
