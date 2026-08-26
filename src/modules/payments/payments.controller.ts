import { Controller, Post, Get, Param, Query, Req, Res, Headers } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // ═══════════════════════ STRIPE ═══════════════════════

  @ApiBearerAuth()
  @Post('cotisations/:cotisationId/pay/stripe')
  createStripeCheckout(@Param('cotisationId') cotisationId: string, @CurrentUser() user: any) {
    return this.paymentsService.createStripeCheckout(cotisationId, user);
  }

  @Public()
  @Post('webhooks/stripe')
  handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleStripeWebhook(signature, req.rawBody!);
  }

  // ═══════════════════════ PAYPAL ═══════════════════════

  @ApiBearerAuth()
  @Post('cotisations/:cotisationId/pay/paypal')
  createPaypalOrder(@Param('cotisationId') cotisationId: string, @CurrentUser() user: any) {
    return this.paymentsService.createPaypalOrder(cotisationId, user);
  }

  @Public()
  @Get('payments/paypal/return')
  async paypalReturn(
    @Query('token') orderId: string,
    @Query('cotisationId') cotisationId: string,
    @Res() res: Response,
  ) {
    const success = await this.paymentsService.capturePaypalOrder(orderId, cotisationId);
    res.set('Content-Type', 'text/html');
    res.send(this.buildResultPage(success));
  }

  @Public()
  @Get('payments/paypal/cancel')
  paypalCancel(@Res() res: Response) {
    res.set('Content-Type', 'text/html');
    res.send(this.buildCancelPage());
  }

  // ── Construit la page HTML sans template literal — évite tout risque de
  // corruption de caractères lors d'un copier-coller (backticks fragiles). ──
  private buildResultPage(success: boolean): string {
    const title = success ? 'Paiement confirme' : 'Le paiement a echoue';
    const message = success
      ? 'Tu peux fermer cette page et retourner dans l application.'
      : 'Reessaie depuis l application.';

    let html = '<!DOCTYPE html>';
    html += '<html lang="fr"><head><meta charset="UTF-8"><title>Paiement</title>';
    html += '<style>';
    html += 'body { font-family: -apple-system, sans-serif; background: #0D1242; color: #fff; ';
    html += 'display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }';
    html += '.box { padding: 32px; }';
    html += 'h1 { font-size: 22px; }';
    html += 'p { color: #B9BEE0; font-size: 14px; }';
    html += '</style></head><body>';
    html += '<div class="box"><h1>' + title + '</h1><p>' + message + '</p></div>';
    html += '</body></html>';
    return html;
  }

  private buildCancelPage(): string {
    let html = '<!DOCTYPE html>';
    html += '<html lang="fr"><head><meta charset="UTF-8"><title>Paiement annule</title>';
    html += '<style>';
    html += 'body { font-family: -apple-system, sans-serif; background: #0D1242; color: #fff; ';
    html += 'display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }';
    html += '.box { padding: 32px; }';
    html += '</style></head><body>';
    html += '<div class="box"><h1>Paiement annule</h1>';
    html += '<p>Tu peux fermer cette page et retourner dans l application.</p></div>';
    html += '</body></html>';
    return html;
  }
}