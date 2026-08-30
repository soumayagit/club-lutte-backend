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
exports.AppelGroupeDto = exports.MarquerPresenceDto = exports.UpdateSeanceDto = exports.CreateSeanceDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const STATUT_PRESENCE = ['PRESENT', 'ABSENT', 'RETARD', 'EXCUSE', 'NON_RENSEIGNE'];
class CreateSeanceDto {
    date;
    lieu;
}
exports.CreateSeanceDto = CreateSeanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-10T18:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSeanceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Salle A' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeanceDto.prototype, "lieu", void 0);
class UpdateSeanceDto {
    date;
    lieu;
    annulee;
    commentaire;
}
exports.UpdateSeanceDto = UpdateSeanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateSeanceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeanceDto.prototype, "lieu", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSeanceDto.prototype, "annulee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeanceDto.prototype, "commentaire", void 0);
class MarquerPresenceDto {
    statut;
    commentaire;
}
exports.MarquerPresenceDto = MarquerPresenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: STATUT_PRESENCE, example: 'PRESENT' }),
    (0, class_validator_1.IsIn)(STATUT_PRESENCE),
    __metadata("design:type", String)
], MarquerPresenceDto.prototype, "statut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MarquerPresenceDto.prototype, "commentaire", void 0);
class AppelGroupeDto {
    presences;
}
exports.AppelGroupeDto = AppelGroupeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Liste des présences à enregistrer en une fois',
        example: [{ adherentId: 'uuid-1', statut: 'PRESENT' }, { adherentId: 'uuid-2', statut: 'ABSENT' }],
    }),
    __metadata("design:type", Array)
], AppelGroupeDto.prototype, "presences", void 0);
