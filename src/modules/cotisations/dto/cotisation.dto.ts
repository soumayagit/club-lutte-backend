import { IsString, IsOptional, IsNumber, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const STATUT_VALUES = ['IMPAYE', 'PAYE', 'PARTIEL'];

export class CreateCotisationDto {
  @ApiProperty({ example: '2025-2026' })
  @IsString()
  saison: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  montant: number;

  @ApiPropertyOptional({ example: '2026-10-15', description: 'Date limite de paiement' })
  @IsOptional()
  @IsDateString()
  echeance?: string;
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

  @ApiPropertyOptional({ example: 'Espèces', description: 'Mode de paiement' })
  @IsOptional()
  @IsString()
  moyenPaiement?: string;

  @ApiPropertyOptional({ example: 'Virement bancaire', description: 'Prestataire (si paiement en ligne)' })
  @IsOptional()
  @IsString()
  prestataire?: string;

  @ApiPropertyOptional({ example: '2026-10-15' })
  @IsOptional()
  @IsDateString()
  echeance?: string;
}