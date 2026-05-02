import logger from "../../shared/loggers/logger";
import { APPLICATION_ROLES, isValidClientRole } from "../../shared/constants/roles";
import AppError from "../../shared/utils/errors/appError";
import crypto from "crypto";
import { Types } from "mongoose";
import { IClient } from "../../shared/models/Client";
import { IApiKey } from "../../shared/models/ApiKey.model";

interface Dependencies {
    clientRepository: any;
    apiKeyRepository: any;
    userRepository: any;
}

export class ClientService {
    private clientRepository: any;
    private apiKeyRepository: any;
    private userRepository: any;

    constructor(dependencies: Dependencies) {
        if (!dependencies?.clientRepository) throw new Error("ClientRepository is required");
        if (!dependencies?.apiKeyRepository) throw new Error("ApiKeyRepository is required");
        if (!dependencies?.userRepository) throw new Error("UserRepository is required");

        this.clientRepository = dependencies.clientRepository;
        this.apiKeyRepository = dependencies.apiKeyRepository;
        this.userRepository = dependencies.userRepository;
    }

    formatClientForResponse(user: any): any {
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        return userObj;
    }

    generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    }

    async createClient(clientData: any, adminUser: any): Promise<IClient> {
        try {
            const { name, email, description, website } = clientData;

            const slug = this.generateSlug(name);
            const existingClient = await this.clientRepository.findBySlug(slug);

            if (existingClient) {
                throw new AppError(`Client with slug ${slug} already exists`, 400);
            }

            return await this.clientRepository.create({
                name,
                slug,
                email,
                description,
                website,
                createdBy: adminUser.userId
            });
        } catch (error) {
            logger.error("Error creating client:", error);
            throw error;
        }
    }

    canUserAccessClient(user: any, clientId: string | Types.ObjectId): boolean {
        if (user.role === APPLICATION_ROLES.SUPER_ADMIN) return true;

        return user.clientId && user.clientId.toString() === clientId.toString();
    }

    async createClientUser(
        clientId: string,
        userData: any,
        adminUser: any
    ): Promise<any> {
        try {
            if (!this.canUserAccessClient(adminUser, clientId)) {
                throw new AppError("Access denied", 403);
            }

            const {
                username,
                email,
                password,
                role = APPLICATION_ROLES.CLIENT_VIEWER
            } = userData;

            if (!isValidClientRole(role)) {
                throw new AppError("Invalid role for client user", 400);
            }

            const client = await this.clientRepository.findById(clientId);
            if (!client) {
                throw new AppError("Client not found", 404);
            }

            let permissions = {
                canCreateApiKeys: false,
                canManageUsers: false,
                canViewAnalytics: true,
                canExportData: false
            };

            if (role === APPLICATION_ROLES.CLIENT_ADMIN) {
                permissions = {
                    canCreateApiKeys: true,
                    canManageUsers: true,
                    canViewAnalytics: true,
                    canExportData: true
                };
            }

            const user = await this.userRepository.create({
                username,
                email,
                password,
                role,
                clientId,
                permissions
            });

            logger.info("Client user created", {
                clientId,
                userId: user._id,
                role
            });

            return this.formatClientForResponse(user);
        } catch (error) {
            logger.error("Error creating client user", error);
            throw error;
        }
    }

    generateApiKey(): string {
        const prefix = "apim";
        const randomBytes = crypto.randomBytes(20).toString("hex");
        return `${prefix}_${randomBytes}`;
    }

    async createApiKey(
        clientId: string,
        keyData: any,
        user: any
    ): Promise<IApiKey> {
        try {
            const client = await this.clientRepository.findById(clientId);
            if (!client) {
                throw new AppError("Client not found", 404);
            }

            if (!this.canUserAccessClient(user, clientId)) {
                throw new AppError("Access denied", 403);
            }

            if (
                !(
                    user.role === APPLICATION_ROLES.SUPER_ADMIN ||
                    user.role === APPLICATION_ROLES.CLIENT_ADMIN
                )
            ) {
                throw new AppError(
                    "Access denied - Only Super Admin and Client Admin can create API keys",
                    403
                );
            }

            const { name, description, environment = "production" } = keyData;

            const keyId = crypto.randomUUID();
            const keyValue = this.generateApiKey();

            return await this.apiKeyRepository.create({
                keyId,
                keyValue,
                clientId,
                name,
                description,
                environment,
                createdBy: user.userId
            });
        } catch (error) {
            logger.error("Error creating API key", error);
            throw error;
        }
    }

    async getClientApiKeys(clientId: string, user: any): Promise<any[]> {
        try {
            if (!this.canUserAccessClient(user, clientId)) {
                throw new AppError("Access denied to this client", 403);
            }

            const apiKeys = await this.apiKeyRepository.findByClientId(clientId);

            return apiKeys.map((key: any) => {
                const keyObj = key.toObject ? key.toObject() : key;
                delete keyObj.keyValue;
                return keyObj;
            });
        } catch (error) {
            logger.error("Error getting client API keys:", error);
            throw error;
        }
    }

    async getClientByApiKey(
        apiKey: string
    ): Promise<{ client: IClient; apiKey: IApiKey } | null> {
        try {
            const key = await this.apiKeyRepository.findByKeyValue(apiKey);

            if (!key) return null;
            if (!key.isActive) return null;
            if (key.isExpired()) return null;

            return {
                client: key.clientId,
                apiKey: key
            };
        } catch (error) {
            logger.error("Error finding client by API key:", error);
            throw error;
        }
    }
}