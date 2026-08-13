import { IsString, IsOptional, IsIn } from 'class-validator';
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
  @ApiProperty({ description: "Le code d'invitation du club", example: 'ETOILE-2K7X' })
  @IsString()
  inviteCode: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({
    enum: ['ADHERENT', 'TUTEUR', 'COACH', 'BUREAU', 'TRESORIER', 'SECRETAIRE', 'ADMIN'],
    example: 'COACH',
  })
  @IsIn(['ADHERENT', 'TUTEUR', 'COACH', 'BUREAU', 'TRESORIER', 'SECRETAIRE', 'ADMIN'])
  role: string;
}