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
exports.DraftAdherentDto = exports.UpdateStatusDto = exports.UpdateAdherentDto = exports.CreateAdherentDto = void 0;
const class_validator_1 = require("class-validator");
const AGE_CATEGORIES = ['Poussins', 'Benjamins', 'Minimes', 'Cadets', 'Juniors', 'Seniors'];
const STATUSES = ['DRAFT', 'SUBMITTED', 'TO_COMPLETE', 'VALIDATED', 'REFUSED', 'ARCHIVED'];
class CreateAdherentDto {
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
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdherentDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdherentDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAdherentDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(AGE_CATEGORIES),
    __metadata("design:type", String)
], CreateAdherentDto.prototype, "ageCategory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAdherentDto.prototype, "weightKg", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdherentDto.prototype, "licenceFFLDA", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAdherentDto.prototype, "tuteurId", void 0);
class UpdateAdherentDto {
    firstName;
    lastName;
    birthDate;
    ageCategory;
    weightKg;
    licenceFFLDA;
}
exports.UpdateAdherentDto = UpdateAdherentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdherentDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdherentDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAdherentDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(AGE_CATEGORIES),
    __metadata("design:type", String)
], UpdateAdherentDto.prototype, "ageCategory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAdherentDto.prototype, "weightKg", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdherentDto.prototype, "licenceFFLDA", void 0);
class UpdateStatusDto {
    status;
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, class_validator_1.IsIn)(STATUSES),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "status", void 0);
class DraftAdherentDto {
    firstName;
    lastName;
    birthDate;
    ageCategory;
    weightKg;
    licenceFFLDA;
}
exports.DraftAdherentDto = DraftAdherentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DraftAdherentDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DraftAdherentDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DraftAdherentDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(AGE_CATEGORIES),
    __metadata("design:type", String)
], DraftAdherentDto.prototype, "ageCategory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DraftAdherentDto.prototype, "weightKg", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DraftAdherentDto.prototype, "licenceFFLDA", void 0);
//# sourceMappingURL=adherent.dto.js.map