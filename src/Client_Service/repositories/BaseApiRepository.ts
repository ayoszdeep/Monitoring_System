import { Model, Types } from "mongoose";
import { IApiKey } from "../../shared/models/ApiKey.model";
import { CreateApiKeyDTO, ApiKeyFilters } from "../dto/apiKey.dto";

export default abstract class BaseApiKeyRepository {
    protected model: Model<IApiKey>;

    constructor(model: Model<IApiKey>) {
        this.model = model;
    }

    abstract create(apiKeyData: CreateApiKeyDTO): Promise<IApiKey>;

    abstract findByKeyValue(
        keyValue: string,
        includeInactive?: boolean
    ): Promise<IApiKey | null>;

    abstract findByClientId(
        clientId: Types.ObjectId,
        filters?: ApiKeyFilters
    ): Promise<IApiKey[]>;

    abstract countByClientId(
        clientId: Types.ObjectId,
        filters?: ApiKeyFilters
    ): Promise<number>;
}