import { Types } from "mongoose";
import { ClientSettings } from "../types/client.types";

export interface CreateClientDTO {
    name: string;
    slug: string;
    email: string;
    description?: string;
    website?: string;
    createdBy: Types.ObjectId;
    settings?: Partial<ClientSettings>;
}

export interface UpdateClientDTO {
    name?: string;
    email?: string;
    description?: string;
    website?: string;
    isActive?: boolean;
    settings?: Partial<ClientSettings>;
}

export interface ClientFilters {
    isActive?: boolean;
    slug?: string;
    email?: string;
}

export interface ClientQueryOptions {
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
}