export declare class CreateAdherentDto {
    firstName: string;
    lastName: string;
    birthDate: string;
    ageCategory?: string;
    weightKg?: number;
    licenceFFLDA?: string;
    tuteurId?: string;
}
export declare class UpdateAdherentDto {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    ageCategory?: string;
    weightKg?: number;
    licenceFFLDA?: string;
}
export declare class UpdateStatusDto {
    status: string;
}
export declare class DraftAdherentDto {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    ageCategory?: string;
    weightKg?: number;
    licenceFFLDA?: string;
}
