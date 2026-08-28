import { IsString, IsOptional, IsNumber, IsIn, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const STATUS_VALUES = ['DRAFT', 'SUBMITTED', 'TO_COMPLETE', 'VALIDATED', 'REFUSED', 'ARCHIVED'];

export class CreateAdherentDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '2010-03-15' })
  @IsString()
  birthDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ageCategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licenceFFLDA?: string;

  @ApiPropertyOptional({ description: 'Uniquement utilisé par le staff/bureau pour rattacher un tuteur' })
  @IsOptional()
  @IsString()
  tuteurId?: string;

  // ── Coordonnées ───────────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'parent@exemple.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '06 12 34 56 78' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ example: '12 rue de la République' })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional({ example: '75001' })
  @IsOptional()
  @IsString()
  codePostal?: string;

  @ApiPropertyOptional({ example: 'Paris' })
  @IsOptional()
  @IsString()
  ville?: string;
}

export class DraftAdherentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '2010-03-15' })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ageCategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licenceFFLDA?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codePostal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ville?: string;
}

export class UpdateAdherentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '2010-03-15' })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ageCategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licenceFFLDA?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codePostal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ville?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: STATUS_VALUES, example: 'VALIDATED' })
  @IsIn(STATUS_VALUES)
  status: string;
}