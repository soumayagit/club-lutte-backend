import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/document.dto';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    upload(adherentId: string, file: Express.Multer.File, dto: UploadDocumentDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: string;
        fileUrl: string;
        extractedData: import("@prisma/client/runtime/library").JsonValue | null;
        adherentId: string;
    }>;
    findByAdherent(adherentId: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: string;
        fileUrl: string;
        extractedData: import("@prisma/client/runtime/library").JsonValue | null;
        adherentId: string;
    }[]>;
    updateStatus(documentId: string, status: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: string;
        fileUrl: string;
        extractedData: import("@prisma/client/runtime/library").JsonValue | null;
        adherentId: string;
    }>;
    remove(documentId: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: string;
        fileUrl: string;
        extractedData: import("@prisma/client/runtime/library").JsonValue | null;
        adherentId: string;
    }>;
}
