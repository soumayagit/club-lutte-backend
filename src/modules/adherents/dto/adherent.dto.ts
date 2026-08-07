import { IsString, IsDateString, IsOptional, IsNumber, IsIn, IsUUID } from 'class-validator';

const AGE_CATEGORIES = ['Poussins', 'Benjamins', 'Minimes', 'Cadets', 'Juniors', 'Seniors'];
const STATUSES = ['DRAFT', 'SUBMITTED', 'TO_COMPLETE', 'VALIDATED', 'REFUSED', 'ARCHIVED'];

export class CreateAdherentDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  birthDate: string;

  @IsOptional()
  @IsIn(AGE_CATEGORIES)
  ageCategory?: string;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsString()
  licenceFFLDA?: string;

  @IsOptional()
  @IsUUID()
  tuteurId?: string;
}

export class UpdateAdherentDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsIn(AGE_CATEGORIES)
  ageCategory?: string;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsString()
  licenceFFLDA?: string;
}

export class UpdateStatusDto {
  @IsIn(STATUSES)
  status: string;
}

// ── Brouillon : tout est optionnel, aucun champ requis, pas de blocage de validation métier ──
export class DraftAdherentDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsIn(AGE_CATEGORIES)
  ageCategory?: string;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsString()
  licenceFFLDA?: string;
}