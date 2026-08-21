"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TarifsModule = void 0;
const common_1 = require("@nestjs/common");
const tarifs_service_1 = require("./tarifs.service");
const tarifs_controller_1 = require("./tarifs.controller");
const clubs_module_1 = require("../clubs/clubs.module");
let TarifsModule = class TarifsModule {
};
exports.TarifsModule = TarifsModule;
exports.TarifsModule = TarifsModule = __decorate([
    (0, common_1.Module)({
        imports: [clubs_module_1.ClubsModule],
        controllers: [tarifs_controller_1.TarifsController],
        providers: [tarifs_service_1.TarifsService],
        exports: [tarifs_service_1.TarifsService],
    })
], TarifsModule);
