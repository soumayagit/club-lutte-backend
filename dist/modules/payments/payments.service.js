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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = __importDefault(require("stripe"));
const paypal = __importStar(require("@paypal/checkout-server-sdk"));
const prisma_service_1 = require("../../prisma/prisma.service");
const clubs_service_1 = require("../clubs/clubs.service");
const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];
let PaymentsService = class PaymentsService {
    prisma;
    clubsService;
    stripe;
    paypalClient;
    constructor(prisma, clubsService) {
        this.prisma = prisma;
        this.clubsService = clubsService;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
        const environment = process.env.PAYPAL_MODE === 'live'
            ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
            : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
        this.paypalClient = new paypal.core.PayPalHttpClient(environment);
    }
    async assertCanPay(cotisationId, currentUser) {
        const cotisation = await this.prisma.cotisation.findUnique({
            where: { id: cotisationId },
            include: { adherent: true },
        });
        if (!cotisation)
            throw new common_1.NotFoundException('Cotisation introuvable');
        const role = await this.clubsService.getRoleInClub(cotisation.adherent.clubId, currentUser);
        const isOwner = (role === 'ADHERENT' && cotisation.adherent.userId === currentUser.id) ||
            (role === 'TUTEUR' && cotisation.adherent.tuteurId === currentUser.id);
        if (!STAFF_ROLES.includes(role) && !isOwner) {
            throw new common_1.ForbiddenException('Tu ne peux pas payer cette cotisation');
        }
        if (cotisation.statut === 'PAYE') {
            throw new common_1.BadRequestException('Cette cotisation est déjà payée');
        }
        return cotisation;
    }
    montantRestant(cotisation) {
        return cotisation.statut === 'PARTIEL'
            ? cotisation.montant - (cotisation.montantVerse ?? 0)
            : cotisation.montant;
    }
    async createStripeCheckout(cotisationId, currentUser) {
        const cotisation = await this.assertCanPay(cotisationId, currentUser);
        const montantAPayer = this.montantRestant(cotisation);
        const appUrl = process.env.APP_URL ?? 'https://api-club.boutique-fflda.fr';
        const session = await this.stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Cotisation ${cotisation.saison} — ${cotisation.adherent.firstName} ${cotisation.adherent.lastName}`,
                        },
                        unit_amount: Math.round(montantAPayer * 100),
                    },
                    quantity: 1,
                },
            ],
            success_url: `${appUrl}/payment-success?cotisationId=${cotisation.id}`,
            cancel_url: `${appUrl}/payment-cancelled?cotisationId=${cotisation.id}`,
            metadata: { cotisationId: cotisation.id },
        });
        return { url: session.url };
    }
    async handleStripeWebhook(signature, rawBody) {
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Signature webhook invalide : ${err.message}`);
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const cotisationId = session.metadata?.cotisationId;
            if (cotisationId) {
                await this.marquerPaye(cotisationId, 'STRIPE', 'Stripe');
            }
        }
        return { received: true };
    }
    async createPaypalOrder(cotisationId, currentUser) {
        const cotisation = await this.assertCanPay(cotisationId, currentUser);
        const montantAPayer = this.montantRestant(cotisation);
        const appUrl = process.env.APP_URL ?? 'https://api-club.boutique-fflda.fr';
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: cotisation.id,
                    description: `Cotisation ${cotisation.saison} — ${cotisation.adherent.firstName} ${cotisation.adherent.lastName}`,
                    amount: {
                        currency_code: 'EUR',
                        value: montantAPayer.toFixed(2),
                    },
                },
            ],
            application_context: {
                return_url: `${appUrl}/api/v1/payments/paypal/return?cotisationId=${cotisation.id}`,
                cancel_url: `${appUrl}/api/v1/payments/paypal/cancel`,
                brand_name: 'Club Lutte FFLDA',
                user_action: 'PAY_NOW',
            },
        });
        const order = await this.paypalClient.execute(request);
        const approveLink = order.result.links.find((l) => l.rel === 'approve');
        return { url: approveLink?.href };
    }
    async capturePaypalOrder(orderId, cotisationId) {
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});
        try {
            const capture = await this.paypalClient.execute(request);
            if (capture.result.status === 'COMPLETED') {
                await this.marquerPaye(cotisationId, 'PAYPAL', 'PayPal');
                return true;
            }
            return false;
        }
        catch (err) {
            return false;
        }
    }
    async marquerPaye(cotisationId, moyenPaiement, prestataire) {
        await this.prisma.cotisation.update({
            where: { id: cotisationId },
            data: {
                statut: 'PAYE',
                datePaiement: new Date(),
                moyenPaiement,
                prestataire,
            },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        clubs_service_1.ClubsService])
], PaymentsService);
