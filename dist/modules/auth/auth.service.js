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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    mailService;
    constructor(prisma, jwtService, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    async signTokens(userId, email) {
        const payload = { sub: userId, email };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '15m',
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: refreshTokenHash },
        });
        return { accessToken, refreshToken };
    }
    async getMemberships(userId) {
        const memberships = await this.prisma.clubMembership.findMany({
            where: { userId, dateFin: null },
            include: { club: true },
        });
        return memberships.map((m) => ({
            clubId: m.clubId,
            clubName: m.club.nom,
            clubVille: m.club.ville,
            clubLogoUrl: m.club.logoUrl,
            role: m.role,
        }));
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.ConflictException('Un compte existe déjà avec cet email');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
            },
        });
        const tokens = await this.signTokens(user.id, user.email);
        const clubs = await this.getMemberships(user.id);
        return { user: this.sanitize(user), clubs, ...tokens };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const tokens = await this.signTokens(user.id, user.email);
        const clubs = await this.getMemberships(user.id);
        return { user: this.sanitize(user), clubs, ...tokens };
    }
    async refresh(userId, refreshToken) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.refreshToken) {
            throw new common_1.UnauthorizedException('Session expirée, reconnecte-toi');
        }
        const valid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!valid) {
            throw new common_1.UnauthorizedException('Refresh token invalide');
        }
        const tokens = await this.signTokens(user.id, user.email);
        return tokens;
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
        return { message: 'Déconnecté' };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) {
            return { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' };
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: tokenHash,
                resetPasswordExpires: expires,
            },
        });
        const resetLink = `${process.env.APP_URL || 'http://localhost:3001'}/reset-password?token=${rawToken}`;
        await this.mailService.sendPasswordResetEmail(user.email, user.firstName, resetLink);
        return { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' };
    }
    async resetPassword(dto) {
        const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: tokenHash,
                resetPasswordExpires: { gt: new Date() },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Lien de réinitialisation invalide ou expiré');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetPasswordToken: null,
                resetPasswordExpires: null,
                refreshToken: null,
            },
        });
        return { message: 'Mot de passe réinitialisé avec succès' };
    }
    sanitize(user) {
        const { passwordHash, refreshToken, resetPasswordToken, resetPasswordExpires, ...safe } = user;
        return safe;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
