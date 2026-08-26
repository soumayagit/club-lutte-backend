import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { AdherentsModule } from './modules/adherents/adherents.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    MailModule,
    AuthModule,
    ClubsModule,
    AdherentsModule,
    DocumentsModule,
    PaymentsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // RolesGuard global RETIRÉ ici — l'ancien vérifiait un rôle global qui n'existe plus.
    // La vérification de rôle se fait maintenant au cas par cas, par club,
    // via ClubsService.getRoleInClub() dans chaque service concerné (adherents, documents...).
    // On réintroduira un guard adapté ("ClubRoleGuard") à l'étape suivante.
  ],
})
export class AppModule {}