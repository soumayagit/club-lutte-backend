"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let MailService = class MailService {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
    async sendPasswordResetEmail(to, firstName, resetLink) {
        await this.transporter.sendMail({
            from: `"Club Lutte FFLDA" <${process.env.GMAIL_USER}>`,
            to,
            subject: 'Réinitialisation de votre mot de passe',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <div style="background:#0D1242; padding:20px; text-align:center;">
            <h2 style="color:#fff; margin:0;">Club Lutte FFLDA</h2>
          </div>
          <div style="padding:24px; color:#1A1D2E;">
            <p>Bonjour ${firstName},</p>
            <p>Tu as demandé la réinitialisation de ton mot de passe. Clique sur le bouton ci-dessous pour en choisir un nouveau (lien valable 1 heure) :</p>
            <p style="text-align:center; margin:28px 0;">
              <a href="${resetLink}" style="background:#E8001C; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">
                Réinitialiser mon mot de passe
              </a>
            </p>
            <p style="font-size:12px; color:#6B7280;">Si tu n'es pas à l'origine de cette demande, ignore simplement cet email.</p>
          </div>
        </div>
      `,
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)()
], MailService);
