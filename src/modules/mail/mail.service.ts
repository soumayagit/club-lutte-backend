import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  async sendPasswordResetEmail(to: string, firstName: string, resetLink: string) {
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
}