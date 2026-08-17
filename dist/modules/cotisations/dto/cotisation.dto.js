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
exports.UpdateCotisationDto = exports.CreateCotisationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const STATUT_VALUES = ['IMPAYE', 'PAYE', 'PARTIEL'];
class CreateCotisationDto {
    saison;
    montant;
    echeance;
}
exports.CreateCotisationDto = CreateCotisationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-2026' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCotisationDto.prototype, "saison", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCotisationDto.prototype, "montant", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-15', description: 'Date limite de paiement' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCotisationDto.prototype, "echeance", void 0);
class UpdateCotisationDto {
    statut;
    montant;
    moyenPaiement;
    prestataire;
    echeance;
}
exports.UpdateCotisationDto = UpdateCotisationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: STATUT_VALUES, example: 'PAYE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(STATUT_VALUES),
    __metadata("design:type", String)
], UpdateCotisationDto.prototype, "statut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCotisationDto.prototype, "montant", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Espèces', description: 'Mode de paiement' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCotisationDto.prototype, "moyenPaiement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Virement bancaire', description: 'Prestataire (si paiement en ligne)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCotisationDto.prototype, "prestataire", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-15' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateCotisationDto.prototype, "echeance", void 0);
