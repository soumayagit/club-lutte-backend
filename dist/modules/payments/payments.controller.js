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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    createStripeCheckout(cotisationId, user) {
        return this.paymentsService.createStripeCheckout(cotisationId, user);
    }
    handleStripeWebhook(req, signature) {
        return this.paymentsService.handleStripeWebhook(signature, req.rawBody);
    }
    createPaypalOrder(cotisationId, user) {
        return this.paymentsService.createPaypalOrder(cotisationId, user);
    }
    async paypalReturn(orderId, cotisationId, res) {
        const success = await this.paymentsService.capturePaypalOrder(orderId, cotisationId);
        res.set('Content-Type', 'text/html');
        res.send(this.buildResultPage(success));
    }
    paypalCancel(res) {
        res.set('Content-Type', 'text/html');
        res.send(this.buildCancelPage());
    }
    buildResultPage(success) {
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
    buildCancelPage() {
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
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('cotisations/:cotisationId/pay/stripe'),
    __param(0, (0, common_1.Param)('cotisationId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createStripeCheckout", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('webhooks/stripe'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "handleStripeWebhook", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('cotisations/:cotisationId/pay/paypal'),
    __param(0, (0, common_1.Param)('cotisationId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createPaypalOrder", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('payments/paypal/return'),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Query)('cotisationId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "paypalReturn", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('payments/paypal/cancel'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "paypalCancel", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
