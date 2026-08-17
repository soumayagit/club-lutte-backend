import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const STATUT_VALUES = ['IMPAYE', 'PAYE', 'PARTIEL'];

export class CreateCotisationDto {
  @ApiProperty({ example: '2025-2026' })
  @IsString()
  saison: string;

  @ApiProperty({ example: 120 })
  @IsNumber()
  montant: number;
}

export class UpdateCotisationDto {
  @ApiPropertyOptional({ enum: STATUT_VALUES, example: 'PAYE' })
  @IsOptional()
  @IsIn(STATUT_VALUES)
  statut?: string;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  montant?: number;

  @ApiPropertyOptional({ example: 'Espèces' })
  @IsOptional()
  @IsString()
  moyenPaiement?: string;
}