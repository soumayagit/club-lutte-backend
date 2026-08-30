import { IsString, IsOptional, IsDateString, IsIn, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const STATUT_PRESENCE = ['PRESENT', 'ABSENT', 'RETARD', 'EXCUSE', 'NON_RENSEIGNE'];

export class CreateSeanceDto {
  @ApiProperty({ example: '2026-09-10T18:00:00.000Z' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Salle A' })
  @IsOptional()
  @IsString()
  lieu?: string;
}

export class UpdateSeanceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lieu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  annulee?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentaire?: string;
}

export class MarquerPresenceDto {
  @ApiProperty({ enum: STATUT_PRESENCE, example: 'PRESENT' })
  @IsIn(STATUT_PRESENCE)
  statut: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentaire?: string;
}

export class AppelGroupeDto {
  @ApiProperty({
    description: 'Liste des présences à enregistrer en une fois',
    example: [{ adherentId: 'uuid-1', statut: 'PRESENT' }, { adherentId: 'uuid-2', statut: 'ABSENT' }],
  })
  presences: { adherentId: string; statut: string; commentaire?: string }[];
}