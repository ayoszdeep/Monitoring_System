import { Model, Types } from "mongoose";
import { IClient } from "../../shared/models/Client";
import {
    CreateClientDTO,
    ClientFilters,
    ClientQueryOptions
} from "../dto/client.dto";

export default abstract class BaseClientRepository {
    protected model: Model<IClient>;

    constructor(model: Model<IClient>) {
        this.model = model;
    }

    abstract create(clientData: CreateClientDTO): Promise<IClient>;

    abstract findById(clientId: Types.ObjectId): Promise<IClient | null>;

    abstract findBySlug(slug: string): Promise<IClient | null>;

    abstract find(
        filters?: ClientFilters,
        options?: ClientQueryOptions
    ): Promise<IClient[]>;

    abstract count(filters?: ClientFilters): Promise<number>;
}