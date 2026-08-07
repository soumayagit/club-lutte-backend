import { IsString, IsOptional, IsIn } from 'class-validator';

const DOCUMENT_TYPES = ['IDENTITY', 'MEDICAL_CERTIFICATE', 'PARENTAL_AUTHORIZATION', 'OTHER'];

export class UploadDocumentDto {
  @IsIn(DOCUMENT_TYPES)
  type: string;

  @IsOptional()
  @IsString()
  extractedData?: string;
}