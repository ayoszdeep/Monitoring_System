export type Environment =
    | "production"
    | "staging"
    | "development"
    | "testing";

export interface ApiKeyPermissions {
    canIngest: boolean;
    canReadAnalytics: boolean;
    allowedServices: string[];
}

export interface ApiKeySecurity {
    allowedIPs: string[];
    allowedOrigins: string[];
    lastRotated: Date;
    rotationWarningDays: number;
}

export interface ApiKeyMetadata {
    createdBy?: string;
    purpose?: string;
    tags: string[];
}