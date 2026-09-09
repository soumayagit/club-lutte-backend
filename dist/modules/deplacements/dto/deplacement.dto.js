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
exports.ValiderAutorisationDto = exports.AffecterPassagerDto = exports.ProposerVehiculeDto = exports.AddParticipantsDto = exports.UpdateDeplacementDto = exports.CreateDeplacementDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateDeplacementDto {
    titre;
    lieu;
    dateDepart;
    dateRetour;
    heureRdv;
    lieuRdv;
    competitionId;
}
exports.CreateDeplacementDto = CreateDeplacementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Tournoi régional — Nancy' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeplacementDto.prototype, "titre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gymnase Jean Jaurès, Nancy' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeplacementDto.prototype, "lieu", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-15T06:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDeplacementDto.prototype, "dateDepart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-15T20:00:00.000Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDeplacementDto.prototype, "dateRetour", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '07:30' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeplacementDto.prototype, "heureRdv", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Parking du gymnase du club' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeplacementDto.prototype, "lieuRdv", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeplacementDto.prototype, "competitionId", void 0);
class UpdateDeplacementDto {
    titre;
    lieu;
    dateDepart;
    dateRetour;
    heureRdv;
    lieuRdv;
    statut;
}
exports.UpdateDeplacementDto = UpdateDeplacementDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeplacementDto.prototype, "titre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeplacementDto.prototype, "lieu", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateDeplacementDto.prototype, "dateDepart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateDeplacementDto.prototype, "dateRetour", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeplacementDto.prototype, "heureRdv", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeplacementDto.prototype, "lieuRdv", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['PLANIFIE', 'VALIDE', 'ANNULE', 'TERMINE'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeplacementDto.prototype, "statut", void 0);
class AddParticipantsDto {
    adherentIds;
}
exports.AddParticipantsDto = AddParticipantsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['uuid-1', 'uuid-2'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AddParticipantsDto.prototype, "adherentIds", void 0);
class ProposerVehiculeDto {
    nbPlaces;
    pointDepart;
    contraintes;
}
exports.ProposerVehiculeDto = ProposerVehiculeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ProposerVehiculeDto.prototype, "nbPlaces", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Devant le club, 18h' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProposerVehiculeDto.prototype, "pointDepart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Pas de mineur seul en covoiturage' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProposerVehiculeDto.prototype, "contraintes", void 0);
class AffecterPassagerDto {
    adherentId;
}
exports.AffecterPassagerDto = AffecterPassagerDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AffecterPassagerDto.prototype, "adherentId", void 0);
class ValiderAutorisationDto {
    autorisationOk;
}
exports.ValiderAutorisationDto = ValiderAutorisationDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ValiderAutorisationDto.prototype, "autorisationOk", void 0);
