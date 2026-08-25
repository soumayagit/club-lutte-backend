import { Controller, Post, Param, Req, Headers } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // ── Crée une session de paiement — nécessite d'être connecté ────────────
  @ApiBearerAuth()
  @Post('cotisations/:cotisationId/pay/stripe')
  createStripeCheckout(@Param('cotisationId') cotisationId: string, @CurrentUser() user: any) {
    return this.paymentsService.createStripeCheckout(cotisationId, user);
  }

  // ── Appelé directement par Stripe, PAS par l'app — pas de JWT ici ───────
  @Public()
  @Post('webhooks/stripe')
  handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleStripeWebhook(signature, req.rawBody!);
  }
}