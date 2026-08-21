import { IsString, IsOptional, IsNumber, IsIn, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetTarifDto {
  @ApiProperty({ example: '2025-2026' })
  @IsString()
  saison: string;

  @ApiPropertyOptional({ example: 'Poussins', description: 'Laisser vide pour un tarif par défaut (toutes catégories)' })
  @IsOptional()
  @IsString()
  categorie?: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  montant: number;
}

export class CreateCodePromoDto {
  @ApiProperty({ example: 'FAMILLE2026' })
  @IsString()
  code: string;

  @ApiProperty({ enum: ['POURCENTAGE', 'MONTANT'], example: 'POURCENTAGE' })
  @IsIn(['POURCENTAGE', 'MONTANT'])
  typeReduction: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  valeur: number;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  dateExpiration?: string;
}

export class UpdateCodePromoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valeur?: number;
}