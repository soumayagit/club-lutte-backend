import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClubDto {
  @ApiProperty({ example: 'RS Étoile Lutte' })
  @IsString()
  nom: string;

  @ApiPropertyOptional({ example: 'Tunis' })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'FFLDA' })
  @IsOptional()
  @IsString()
  federation?: string;
}

export class JoinClubDto {
  @ApiProperty({ description: "L'id du club à rejoindre" })
  @IsString()
  clubId: string;
}