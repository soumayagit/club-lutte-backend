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
exports.CreateCreneauDto = exports.UpdateGroupeDto = exports.CreateGroupeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateGroupeDto {
    nom;
    categorie;
    description;
}
exports.CreateGroupeDto = CreateGroupeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Compétiteurs Cadets' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupeDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Cadets' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupeDto.prototype, "categorie", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupeDto.prototype, "description", void 0);
class UpdateGroupeDto {
    nom;
    categorie;
    description;
}
exports.UpdateGroupeDto = UpdateGroupeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateGroupeDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateGroupeDto.prototype, "categorie", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateGroupeDto.prototype, "description", void 0);
class CreateCreneauDto {
    jour;
    heureDebut;
    heureFin;
    lieu;
}
exports.CreateCreneauDto = CreateCreneauDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '0 = lundi ... 6 = dimanche', example: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], CreateCreneauDto.prototype, "jour", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '18:00' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreneauDto.prototype, "heureDebut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '19:30' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreneauDto.prototype, "heureFin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Salle A' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreneauDto.prototype, "lieu", void 0);
