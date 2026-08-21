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
exports.UpdateCodePromoDto = exports.CreateCodePromoDto = exports.SetTarifDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SetTarifDto {
    saison;
    categorie;
    montant;
}
exports.SetTarifDto = SetTarifDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-2026' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetTarifDto.prototype, "saison", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Poussins', description: 'Laisser vide pour un tarif par défaut (toutes catégories)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetTarifDto.prototype, "categorie", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SetTarifDto.prototype, "montant", void 0);
class CreateCodePromoDto {
    code;
    typeReduction;
    valeur;
    dateExpiration;
}
exports.CreateCodePromoDto = CreateCodePromoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'FAMILLE2026' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCodePromoDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['POURCENTAGE', 'MONTANT'], example: 'POURCENTAGE' }),
    (0, class_validator_1.IsIn)(['POURCENTAGE', 'MONTANT']),
    __metadata("design:type", String)
], CreateCodePromoDto.prototype, "typeReduction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCodePromoDto.prototype, "valeur", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-12-31' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCodePromoDto.prototype, "dateExpiration", void 0);
class UpdateCodePromoDto {
    actif;
    valeur;
}
exports.UpdateCodePromoDto = UpdateCodePromoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCodePromoDto.prototype, "actif", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCodePromoDto.prototype, "valeur", void 0);
