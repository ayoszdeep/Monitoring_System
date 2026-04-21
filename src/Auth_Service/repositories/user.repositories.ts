import BaseRepository from "./base.repositories"
import User from "../../shared/models/User.model";
import { IUser } from "../types/user.types";
import logger from "../../shared/loggers/logger";


class MongoUserRepository extends BaseRepository<IUser> {

    constructor() {
        super(User);
    }

    /**
     * Creates a new user in the database.
     */
    async create(userData: Partial<IUser>): Promise<IUser> {
        try {
            const data = { ...userData };

            if (data.role === "super_admin" && !data.permissions) {
                data.permissions = {
                    canCreateApiKeys: true,
                    canManageUsers: true,
                    canViewAnalytics: true,
                    canExportData: true,
                };
            }

            const user = new this.model(data);
            await user.save();

            logger.info("User created", { username: user.username });

            return user;
        } catch (error: any) {
            logger.error("Error creating user", error);
            throw error;
        }
    }

    /**
     * Finds a user by ID
     */
    async findById(userId: string): Promise<IUser | null> {
        try {
            return await this.model.findById(userId);
        } catch (error: any) {
            logger.error("Error finding user by id", error);
            throw error;
        }
    }

    /**
     * Finds a user by username
     */
    async findByUsername(username: string): Promise<IUser | null> {
        try {
            return await this.model.findOne({ username });
        } catch (error: any) {
            logger.error("Error finding user by username", error);
            throw error;
        }
    }

    /**
     * Finds a user by email
     */
    async findByEmail(email: string): Promise<IUser | null> {
        try {
            return await this.model.findOne({ email });
        } catch (error: any) {
            logger.error("Error finding user by email", error);
            throw error;
        }
    }

    /**
     * Finds all active users
     */
    async findAll(): Promise<IUser[]> {
        try {
            return await this.model
                .find({ isActive: true })
                .select("-password");
        } catch (error: any) {
            logger.error("Error finding users", error);
            throw error;
        }
    }
}

export default new MongoUserRepository();