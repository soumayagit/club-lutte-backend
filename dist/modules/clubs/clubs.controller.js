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
exports.ClubsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
const clubs_service_1 = require("./clubs.service");
const club_dto_1 = require("./dto/club.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
let ClubsController = class ClubsController {
    clubsService;
    constructor(clubsService) {
        this.clubsService = clubsService;
    }
    create(dto, user) {
        return this.clubsService.create(dto, user);
    }
    findMine(user) {
        return this.clubsService.findMine(user);
    }
    findOne(clubId, user) {
        return this.clubsService.findOne(clubId, user);
    }
    updateInfo(clubId, dto, user) {
        return this.clubsService.updateInfo(clubId, dto, user);
    }
    join(dto, user) {
        return this.clubsService.join(dto, user);
    }
    uploadLogo(clubId, file, user) {
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier reçu');
        }
        const logoUrl = `/uploads/clubs/${file.filename}`;
        return this.clubsService.updateLogo(clubId, logoUrl, user);
    }
    getMembers(clubId, user) {
        return this.clubsService.getMembers(clubId, user);
    }
    updateMemberRole(clubId, userId, dto, user) {
        return this.clubsService.updateMemberRole(clubId, userId, dto.role, user);
    }
    removeMember(clubId, userId, user) {
        return this.clubsService.removeMember(clubId, userId, user);
    }
};
exports.ClubsController = ClubsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [club_dto_1.CreateClubDto, Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)(':clubId'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':clubId'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, club_dto_1.UpdateClubDto, Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "updateInfo", null);
__decorate([
    (0, common_1.Post)('join'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [club_dto_1.JoinClubDto, Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "join", null);
__decorate([
    (0, common_1.Post)(':clubId/logo'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/clubs',
            filename: (req, file, cb) => {
                const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                cb(null, `${unique}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!ALLOWED_MIME.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Format non autorisé (JPEG, PNG ou WebP uniquement)'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "uploadLogo", null);
__decorate([
    (0, common_1.Get)(':clubId/members'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Patch)(':clubId/members/:userId/role'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, club_dto_1.UpdateMemberRoleDto, Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "updateMemberRole", null);
__decorate([
    (0, common_1.Delete)(':clubId/members/:userId'),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "removeMember", null);
exports.ClubsController = ClubsController = __decorate([
    (0, swagger_1.ApiTags)('clubs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('clubs'),
    __metadata("design:paramtypes", [clubs_service_1.ClubsService])
], ClubsController);
