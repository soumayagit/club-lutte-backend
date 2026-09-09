import { IsString, IsOptional, IsDateString, IsInt, Min, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeplacementDto {
  @ApiProperty({ example: 'Tournoi régional — Nancy' })
  @IsString()
  titre: string;

  @ApiProperty({ example: 'Gymnase Jean Jaurès, Nancy' })
  @IsString()
  lieu: string;

  @ApiProperty({ example: '2026-10-15T06:00:00.000Z' })
  @IsDateString()
  dateDepart: string;

  @ApiPropertyOptional({ example: '2026-10-15T20:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dateRetour?: string;

  @ApiPropertyOptional({ example: '07:30' })
  @IsOptional()
  @IsString()
  heureRdv?: string;

  @ApiPropertyOptional({ example: 'Parking du gymnase du club' })
  @IsOptional()
  @IsString()
  lieuRdv?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  competitionId?: string;
}

export class UpdateDeplacementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lieu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateDepart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateRetour?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  heureRdv?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lieuRdv?: string;

  @ApiPropertyOptional({ enum: ['PLANIFIE', 'VALIDE', 'ANNULE', 'TERMINE'] })
  @IsOptional()
  @IsString()
  statut?: string;
}

export class AddParticipantsDto {
  @ApiProperty({ example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  adherentIds: string[];
}

export class ProposerVehiculeDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  nbPlaces: number;

  @ApiPropertyOptional({ example: 'Devant le club, 18h' })
  @IsOptional()
  @IsString()
  pointDepart?: string;

  @ApiPropertyOptional({ example: 'Pas de mineur seul en covoiturage' })
  @IsOptional()
  @IsString()
  contraintes?: string;
}

export class AffecterPassagerDto {
  @ApiProperty()
  @IsString()
  adherentId: string;
}

export class ValiderAutorisationDto {
  @ApiProperty()
  @IsBoolean()
  autorisationOk: boolean;
}