import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupeDto {
  @ApiProperty({ example: 'Compétiteurs Cadets' })
  @IsString()
  nom: string;

  @ApiPropertyOptional({ example: 'Cadets' })
  @IsOptional()
  @IsString()
  categorie?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateGroupeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categorie?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateCreneauDto {
  @ApiProperty({ description: '0 = lundi ... 6 = dimanche', example: 1 })
  @IsInt()
  @Min(0)
  @Max(6)
  jour: number;

  @ApiProperty({ example: '18:00' })
  @IsString()
  heureDebut: string;

  @ApiProperty({ example: '19:30' })
  @IsString()
  heureFin: string;

  @ApiPropertyOptional({ example: 'Salle A' })
  @IsOptional()
  @IsString()
  lieu?: string;
}