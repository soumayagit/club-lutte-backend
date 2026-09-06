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
exports.UpdateStatusDto = exports.UpdateAdherentDto = exports.DraftAdherentDto = exports.CreateAdherentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const STATUS_VALUES = ['DRAFT', 'SUBMITTED', 'TO_COMPLETE', 'VALIDATED', 'REFUSED', 'ARCHIVED'];
const SEXE_VALUES = ['HOMME', 'FEMME'];
const TYPE_ADHESION_VALUES = ['ENFANT', 'ADULTE', 'LOISIR', 'COMPETITION', 'DIRIGEANT', 'BENEVOLE', 'ESSAI'];
class AdherentFieldsMixin {
    sexe;
    lieuNaissance;
    nationalite;
    typeAdhesion;
    niveau;
    stylePratique;
    allergies;
    questionnaireSante;
    ancienneLicence;
    clubPrecedent;
    email;
    telephone;
    adresse;
    codePostal;
    ville;
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: SEXE_VALUES }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(SEXE_VALUES),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "sexe", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Tunis' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "lieuNaissance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Française' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "nationalite", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TYPE_ADHESION_VALUES, example: 'ADULTE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(TYPE_ADHESION_VALUES),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "typeAdhesion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Débutant' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "niveau", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Lutte libre' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "stylePratique", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Aucune' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "allergies", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "questionnaireSante", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "ancienneLicence", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "clubPrecedent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'parent@exemple.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '06 12 34 56 78' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '12 rue de la République' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '75001' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "codePostal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Paris' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdherentFieldsMixin.prototype, "ville", void 0);
class CreateAdherentDto extends AdherentFieldsMixin {
    firstName;
    lastName;
    birthDate;
    ageCategory;
    weightKg;
    licenceFFLDA;
    tuteurId;
}
exports.CreateAdherentDto = CreateAdherentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdherentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdherentDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2010-03-15' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdherentDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdherentDto.prototype, "ageCategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAdherentDto.prototype, "weightKg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdherentDto.prototype, "licenceFFLDA", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Uniquement utilisé par le staff/bureau pour rattacher un tuteur' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdherentDto.prototype, "tuteurId", void 0);
class DraftAdherentDto extends AdherentFieldsMixin {
    firstName;
    lastName;
    birthDate;
    ageCategory;
    weightKg;
    licenceFFLDA;
}
exports.DraftAdherentDto = DraftAdherentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DraftAdherentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DraftAdherentDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2010-03-15' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DraftAdherentDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DraftAdherentDto.prototype, "ageCategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DraftAdherentDto.prototype, "weightKg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DraftAdherentDto.prototype, "licenceFFLDA", void 0);
class UpdateAdherentDto extends AdherentFieldsMixin {
    firstName;
    lastName;
    birthDate;
    ageCategory;
    weightKg;
    licenceFFLDA;
    certificatMedicalOk;
}
exports.UpdateAdherentDto = UpdateAdherentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdherentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdherentDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2010-03-15' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdherentDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdherentDto.prototype, "ageCategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAdherentDto.prototype, "weightKg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdherentDto.prototype, "licenceFFLDA", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAdherentDto.prototype, "certificatMedicalOk", void 0);
class UpdateStatusDto {
    status;
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: STATUS_VALUES, example: 'VALIDATED' }),
    (0, class_validator_1.IsIn)(STATUS_VALUES),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "status", void 0);
