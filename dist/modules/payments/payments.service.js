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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = __importDefault(require("stripe"));
const prisma_service_1 = require("../../prisma/prisma.service");
const clubs_service_1 = require("../clubs/clubs.service");
const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];
let PaymentsService = class PaymentsService {
    prisma;
    clubsService;
    stripe;
    constructor(prisma, clubsService) {
        this.prisma = prisma;
        this.clubsService = clubsService;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
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
    async createStripeCheckout(cotisationId, currentUser) {
        const cotisation = await this.assertCanPay(cotisationId, currentUser);
        const montantAPayer = cotisation.statut === 'PARTIEL'
            ? cotisation.montant - (cotisation.montantVerse ?? 0)
            : cotisation.montant;
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
            metadata: {
                cotisationId: cotisation.id,
            },
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
                await this.prisma.cotisation.update({
                    where: { id: cotisationId },
                    data: {
                        statut: 'PAYE',
                        datePaiement: new Date(),
                        moyenPaiement: 'STRIPE',
                        prestataire: 'Stripe',
                    },
                });
            }
        }
        return { received: true };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        clubs_service_1.ClubsService])
], PaymentsService);
