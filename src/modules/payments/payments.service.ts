import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
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

  constructor(
    private prisma: PrismaService,
    private clubsService: ClubsService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  // ── Vérifie que la personne peut payer CETTE cotisation (elle-même, son
  // tuteur, ou le staff qui l'aide) ────────────────────────────────────────
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

  // ── Crée une session de paiement Stripe, renvoie l'URL à ouvrir ──────────
  async createStripeCheckout(cotisationId: string, currentUser: CurrentUser) {
    const cotisation = await this.assertCanPay(cotisationId, currentUser);

    // Si un paiement partiel a déjà été fait, on ne demande que le reste.
    const montantAPayer =
      cotisation.statut === 'PARTIEL'
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
            unit_amount: Math.round(montantAPayer * 100), // Stripe attend des centimes
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

  // ── Traite la confirmation envoyée par Stripe (webhook) ──────────────────
  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      throw new BadRequestException(`Signature webhook invalide : ${(err as Error).message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
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
}