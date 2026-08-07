import { PrismaService } from '../../prisma/prisma.service';
interface CurrentUser {
    id: string;
    email: string;
    role: string;
}
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertAccessToAdherent;
    upload(adherentId: string, type: string, fileUrl: string, extractedData: string | undefined, currentUser: CurrentUser): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: string;
        fileUrl: string;
        extractedData: import("@prisma/client/runtime/library").JsonValue | null;
        adherentId: string;
    }>;
    findByAdherent(adherentId: string, currentUser: CurrentUser): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: string;
        fileUrl: string;
        extractedData: import("@prisma/client/runtime/library").JsonValue | null;
        adherentId: string;
    }[]>;
    updateStatus(documentId: string, status: string, currentUser: CurrentUser): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: string;
        fileUrl: string;
        extractedData: import("@prisma/client/runtime/library").JsonValue | null;
        adherentId: string;
    }>;
    remove(documentId: string, currentUser: CurrentUser): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: string;
        fileUrl: string;
        extractedData: import("@prisma/client/runtime/library").JsonValue | null;
        adherentId: string;
    }>;
}
export {};
