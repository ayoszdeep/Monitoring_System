import { Types } from "mongoose";
import {
    Environment,
    ApiKeyPermissions,
    ApiKeySecurity,
    ApiKeyMetadata
} from "../types/apiKey.types";

export interface CreateApiKeyDTO {
    keyId: string;
    keyValue: string;
    clientId: Types.ObjectId;
    name: string;
    description?: string;
    environment?: Environment;
    permissions?: Partial<ApiKeyPermissions>;
    security?: Partial<ApiKeySecurity>;
    expiresAt?: Date;
    metadata?: ApiKeyMetadata;
    createdBy: Types.ObjectId;
}

export interface ApiKeyFilters {
    isActive?: boolean;
    environment?: Environment;
}