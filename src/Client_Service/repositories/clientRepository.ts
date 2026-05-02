import { Types } from "mongoose";
import BaseClientRepository from "./BaseClientRepository";
import Client, { IClient } from "../../shared/models/Client";
import logger from "../../shared/loggers/logger";
import {
    CreateClientDTO,
    ClientFilters,
    ClientQueryOptions
} from "../dto/client.dto";

class MongoClientRepository extends BaseClientRepository {
    constructor() {
        super(Client);
    }

    async create(clientData: CreateClientDTO): Promise<IClient> {
        try {
            const client = new this.model(clientData);
            await client.save();

            logger.info("Client created in MongoDB", {
                mongoId: client._id,
                slug: client.slug
            });

            return client;
        } catch (error) {
            logger.error("Error creating client in db", error);
            throw error;
        }
    }

    async findById(clientId: Types.ObjectId): Promise<IClient | null> {
        try {
            const client = await this.model.findById(clientId).exec();

            logger.info("Client details from MongoDB", client);

            return client;
        } catch (error) {
            logger.error("Error finding client in db by id", error);
            throw error;
        }
    }

    async findBySlug(slug: string): Promise<IClient | null> {
        try {
            return await this.model.findOne({ slug }).exec();
        } catch (error) {
            logger.error("Error finding client by slug:", error);
            throw error;
        }
    }

    async find(
        filters: ClientFilters = {},
        options: ClientQueryOptions = {}
    ): Promise<IClient[]> {
        try {
            const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

            return await this.model
                .find(filters)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select("-__v")
                .exec();
        } catch (error) {
            logger.error("Error finding clients:", error);
            throw error;
        }
    }

    async count(filters: ClientFilters = {}): Promise<number> {
        try {
            return await this.model.countDocuments(filters);
        } catch (error) {
            logger.error("Error counting clients:", error);
            throw error;
        }
    }
}

export default new MongoClientRepository();