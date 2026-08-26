import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import * as paypal from '@paypal/checkout-server-sdk';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubsService } from '../clubs/clubs.service';

interface CurrentUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

const STAFF_ROLES = ['BUREAU', 'ADMIN', 'COACH', 'SECRETAIRE', 'TRESORIER'];

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private paypalClient: paypal.core.PayPalHttpClient;

  constructor(
    private prisma: PrismaService,
    private clubsService: ClubsService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // ── PayPal : "sandbox" pour tester, "live" pour la vraie prod ──────────
    const environment =
      process.env.PAYPAL_MODE === 'live'
        ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)
        : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!);
    this.paypalClient = new paypal.core.PayPalHttpClient(environment);
  }

  // ── Vérifie que la personne peut payer CETTE cotisation ──────────────────
  private async assertCanPay(cotisationId: string, currentUser: CurrentUser) {
    const cotisation = await this.prisma.cotisation.findUnique({
      where: { id: cotisationId },
      include: { adherent: true },
    });
    if (!cotisation) throw new NotFoundException('Cotisation introuvable');

    const role = await this.clubsService.getRoleInClub(cotisation.adherent.clubId, currentUser);
    const isOwner =
      (role === 'ADHERENT' && cotisation.adherent.userId === currentUser.id) ||
      (role === 'TUTEUR' && cotisation.adherent.tuteurId === currentUser.id);

    if (!STAFF_ROLES.includes(role) && !isOwner) {
      throw new ForbiddenException('Tu ne peux pas payer cette cotisation');
    }
    if (cotisation.statut === 'PAYE') {
      throw new BadRequestException('Cette cotisation est déjà payée');
    }
    return cotisation;
  }

  private montantRestant(cotisation: any): number {
    return cotisation.statut === 'PARTIEL'
      ? cotisation.montant - (cotisation.montantVerse ?? 0)
      : cotisation.montant;
  }

  // ═══════════════════════ STRIPE ═══════════════════════

  async createStripeCheckout(cotisationId: string, currentUser: CurrentUser) {
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

  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      throw new BadRequestException(`Signature webhook invalide : ${(err as Error).message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const cotisationId = session.metadata?.cotisationId;
      if (cotisationId) {
        await this.marquerPaye(cotisationId, 'STRIPE', 'Stripe');
      }
    }

    return { received: true };
  }

  // ═══════════════════════ PAYPAL ═══════════════════════

  // ── Crée une commande PayPal, renvoie l'URL d'approbation ────────────────
  async createPaypalOrder(cotisationId: string, currentUser: CurrentUser) {
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
        // Ces routes GET traitent la confirmation directement (pas de webhook nécessaire) —
        // PayPal y ajoute automatiquement ?token=ID_COMMANDE en paramètre.
        return_url: `${appUrl}/api/v1/payments/paypal/return?cotisationId=${cotisation.id}`,
        cancel_url: `${appUrl}/api/v1/payments/paypal/cancel`,
        brand_name: 'Club Lutte FFLDA',
        user_action: 'PAY_NOW',
      },
    });

    const order = await this.paypalClient.execute(request);
    const approveLink = order.result.links.find((l: any) => l.rel === 'approve');

    return { url: approveLink?.href };
  }

  // ── Appelé quand l'utilisateur revient de PayPal après avoir approuvé ────
  async capturePaypalOrder(orderId: string, cotisationId: string): Promise<boolean> {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    (request as any).requestBody({});

    try {
      const capture = await this.paypalClient.execute(request);
      if (capture.result.status === 'COMPLETED') {
        await this.marquerPaye(cotisationId, 'PAYPAL', 'PayPal');
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  // ═══════════════════════ COMMUN ═══════════════════════

  private async marquerPaye(cotisationId: string, moyenPaiement: string, prestataire: string) {
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
}