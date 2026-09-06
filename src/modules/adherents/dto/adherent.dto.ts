import { IsString, IsOptional, IsNumber, IsIn, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const STATUS_VALUES = ['DRAFT', 'SUBMITTED', 'TO_COMPLETE', 'VALIDATED', 'REFUSED', 'ARCHIVED'];
const SEXE_VALUES = ['HOMME', 'FEMME'];
const TYPE_ADHESION_VALUES = ['ENFANT', 'ADULTE', 'LOISIR', 'COMPETITION', 'DIRIGEANT', 'BENEVOLE', 'ESSAI'];

// ── Champs communs réutilisés dans les 3 DTOs ci-dessous ─────────────────
class AdherentFieldsMixin {
  @ApiPropertyOptional({ enum: SEXE_VALUES })
  @IsOptional()
  @IsIn(SEXE_VALUES)
  sexe?: string;

  @ApiPropertyOptional({ example: 'Tunis' })
  @IsOptional()
  @IsString()
  lieuNaissance?: string;

  @ApiPropertyOptional({ example: 'Française' })
  @IsOptional()
  @IsString()
  nationalite?: string;

  @ApiPropertyOptional({ enum: TYPE_ADHESION_VALUES, example: 'ADULTE' })
  @IsOptional()
  @IsIn(TYPE_ADHESION_VALUES)
  typeAdhesion?: string;

  @ApiPropertyOptional({ example: 'Débutant' })
  @IsOptional()
  @IsString()
  niveau?: string;

  @ApiPropertyOptional({ example: 'Lutte libre' })
  @IsOptional()
  @IsString()
  stylePratique?: string;

  @ApiPropertyOptional({ example: 'Aucune' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  questionnaireSante?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ancienneLicence?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clubPrecedent?: string;

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

export class CreateAdherentDto extends AdherentFieldsMixin {
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
}

export class DraftAdherentDto extends AdherentFieldsMixin {
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
}

export class UpdateAdherentDto extends AdherentFieldsMixin {
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
  @IsBoolean()
  certificatMedicalOk?: boolean;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: STATUS_VALUES, example: 'VALIDATED' })
  @IsIn(STATUS_VALUES)
  status: string;
}