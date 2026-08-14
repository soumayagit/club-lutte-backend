import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      // Accepte le token soit dans le header Authorization (usage normal de l'app),
      // soit en paramètre ?token= dans l'URL (nécessaire pour les liens de
      // téléchargement ouverts directement dans le navigateur, où on ne peut
      // pas facilement ajouter un header).
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req?.query?.token || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      return null;
    }
    // Plus de "role" ici — request.user contient juste l'identité.
    // Le rôle par club se vérifie séparément via ClubMembership, selon le :clubId de la route.
    return { id: user.id, email: user.email, isSuperAdmin: user.isSuperAdmin };
  }
}