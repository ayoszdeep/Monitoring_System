export interface ClientSettings {
    dataRetentionDays: number;
    alertsEnabled: boolean;
    timezone: string;
}

export interface ClientMetadata {
    tags?: string[];
    notes?: string;
}