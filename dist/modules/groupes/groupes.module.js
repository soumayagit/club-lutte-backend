"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupesModule = void 0;
const common_1 = require("@nestjs/common");
const groupes_service_1 = require("./groupes.service");
const groupes_controller_1 = require("./groupes.controller");
const clubs_module_1 = require("../clubs/clubs.module");
let GroupesModule = class GroupesModule {
};
exports.GroupesModule = GroupesModule;
exports.GroupesModule = GroupesModule = __decorate([
    (0, common_1.Module)({
        imports: [clubs_module_1.ClubsModule],
        controllers: [groupes_controller_1.GroupesController],
        providers: [groupes_service_1.GroupesService],
        exports: [groupes_service_1.GroupesService],
    })
], GroupesModule);
