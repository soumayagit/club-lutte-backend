import { IsString, IsOptional, IsNumber, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const STATUT_VALUES = ['IMPAYE', 'PAYE', 'PARTIEL'];
const MOYEN_PAIEMENT_VALUES = ['ESPECES', 'CHEQUE', 'VIREMENT', 'PASS_SPORT', 'COUPON', 'STRIPE', 'PAYPAL'];

export class CreateCotisationDto {
  @ApiProperty({ example: '2025-2026' })
  @IsString()
  saison: string;

  @ApiPropertyOptional({ example: '2026-10-15', description: 'Date limite de paiement' })
  @IsOptional()
  @IsDateString()
  echeance?: string;

  @ApiPropertyOptional({ example: 'FAMILLE2026' })
  @IsOptional()
  @IsString()
  codePromo?: string;
}

export class UpdateCotisationDto {
  @ApiPropertyOptional({ enum: STATUT_VALUES, example: 'PAYE' })
  @IsOptional()
  @IsIn(STATUT_VALUES)
  statut?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  montant?: number;

  @ApiPropertyOptional({
    description: 'Ce qui a réellement été versé — obligatoire si statut = PARTIEL',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  montantVerse?: number;

  @ApiPropertyOptional({ enum: MOYEN_PAIEMENT_VALUES, example: 'ESPECES' })
  @IsOptional()
  @IsIn(MOYEN_PAIEMENT_VALUES)
  moyenPaiement?: string;

  @ApiPropertyOptional({ example: 'Stripe', description: 'Prestataire (si paiement en ligne)' })
  @IsOptional()
  @IsString()
  prestataire?: string;

  @ApiPropertyOptional({ example: '2026-10-15' })
  @IsOptional()
  @IsDateString()
  echeance?: string;
}