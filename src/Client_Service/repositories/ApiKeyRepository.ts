import { Types } from "mongoose";
import logger from "../../shared/loggers/logger";
import ApiKey, { IApiKey } from "../../shared/models/ApiKey.model";
import BaseApiKeyRepository from "./BaseApiRepository";
import { CreateApiKeyDTO, ApiKeyFilters } from "../dto/apiKey.dto";

class MongoApiKeyRepository extends BaseApiKeyRepository {
    constructor() {
        super(ApiKey);
    }

    async create(apiKeyData: CreateApiKeyDTO): Promise<IApiKey> {
        try {
            const apiKey = new this.model(apiKeyData);
            await apiKey.save();
            logger.info("API key created in database", { keyId: apiKey.keyId });
            return apiKey;
        } catch (error) {
            logger.error("Error creating API key in database:", error);
            throw error;
        }
    }

    async findByKeyValue(
        keyValue: string,
        includeInactive = false
    ): Promise<IApiKey | null> {
        try {
            const filter: any = { keyValue };
            if (!includeInactive) filter.isActive = true;

            return await this.model
                .findOne(filter)
                .populate("clientId")
                .exec();
        } catch (error) {
            logger.error("Error finding API key by value:", error);
            throw error;
        }
    }

    async findByClientId(
        clientId: Types.ObjectId,
        filters: ApiKeyFilters = {}
    ): Promise<IApiKey[]> {
        try {
            return await this.model
                .find({ clientId, ...filters })
                .populate("createdBy", "username email")
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            logger.error("Error finding API keys by client ID:", error);
            throw error;
        }
    }

    async countByClientId(
        clientId: Types.ObjectId,
        filters: ApiKeyFilters = {}
    ): Promise<number> {
        try {
            return await this.model.countDocuments({
                clientId,
                ...filters
            });
        } catch (error) {
            logger.error("Error counting API keys:", error);
            throw error;
        }
    }
}

export default new MongoApiKeyRepository();