import config from "../../shared/config/config";
import AppError from "../../shared/utils/errors/appError";
import jwt from "jsonwebtoken";
import logger from "../../shared/loggers/logger";
import argon2 from "argon2";
import { APPLICATION_ROLES } from "../../shared/constants/roles";
import { IUser } from "../types/user.types";
import { RegisterDTO, LoginDTO, UserResponseDTO } from "../dto/auth.dto";

interface IUserRepository {
    findAll(): Promise<IUser[]>;
    findByUsername(username: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
    create(data: Partial<IUser>): Promise<IUser>;
}

export class AuthService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        if (!userRepository) {
            throw new Error("UserRepository is Required");
        }
        this.userRepository = userRepository;
    }

    generateToken(user: IUser): string {
        const { _id, email, username, role, clientId } = user;

        const payload = {
            userId: _id,
            username,
            email,
            role,
            clientId,
        };

        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn as any,
        });
    }

    
    formatUserForResponse(user: IUser): UserResponseDTO {
        const userObj: any = "toObject" in user ? (user as any).toObject() : { ...user };
        delete userObj.password;
        return userObj as UserResponseDTO;
    }
    
    async comparePassword(
        userEnteredPassword: string,
        hashedPassword: string
    ): Promise<boolean> {
        return await argon2.verify(hashedPassword, userEnteredPassword);
    }

    // 👑 Super Admin Onboarding
    async onboardSuperAdmin(superAdminData: RegisterDTO) {
        try {
            const existingUsers = await this.userRepository.findAll();

            if (existingUsers.length > 0) {
                throw new AppError("Super admin onboarding is disabled", 403);
            }

            const user = await this.userRepository.create(superAdminData as Partial<IUser>);
            const token = this.generateToken(user);

            logger.info("Admin onboarded successfully", {
                username: user.username,
            });

            return {
                user: this.formatUserForResponse(user),
                token,
            };
        } catch (error: any) {
            logger.error("Error in onboarding Super admin", error);
            throw error;
        }
    }

    // 📝 Register User
    async register(userData: RegisterDTO) {
        try {
            const existingUser = await this.userRepository.findByUsername(
                userData.username!
            );
            if (existingUser) {
                throw new AppError("Username already exists", 409);
            }

            const existingEmail = await this.userRepository.findByEmail(
                userData.email!
            );
            if (existingEmail) {
                throw new AppError("Email already exists", 409);
            }

            const user = await this.userRepository.create(userData as Partial<IUser>);
            const token = this.generateToken(user);

            logger.info("User registered successfully", {
                username: user.username,
            });

            return {
                user: this.formatUserForResponse(user),
                token,
            };
        } catch (error: any) {
            logger.error("Error in Register service", error);
            throw error;
        }
    }

    // 🔓 Login
    async login(loginData: LoginDTO) {
        try {
            const { username, password } = loginData;
            const user = await this.userRepository.findByUsername(username);

            if (!user) {
                throw new AppError("Invalid Credentials", 401);
            }

            if (!user.isActive) {
                throw new AppError("Account is deactivated", 403);
            }

            const isPasswordValid = await this.comparePassword(
                password,
                user.password
            );

            if (!isPasswordValid) {
                throw new AppError("Invalid Credentials", 401);
            }

            const token = this.generateToken(user);

            logger.info("User logged in successfully", {
                username: user.username,
            });

            return {
                user: this.formatUserForResponse(user),
                token,
            };
        } catch (error: any) {
            logger.error("Error in Login service", error);
            throw error;
        }
    }

    // 👤 Get Profile
    async getProfile(userId: string) {
        try {
            const user = await this.userRepository.findById(userId);

            if (!user) {
                throw new AppError("User not found", 404);
            }

            return this.formatUserForResponse(user);
        } catch (error: any) {
            logger.error("Error getting user profile:", error);
            throw error;
        }
    }

    // 👑 Check Super Admin
    async checkSuperAdminPermissions(userId: string): Promise<boolean> {
        try {
            const user = await this.userRepository.findById(userId);

            if (!user) {
                throw new AppError("User not found", 404);
            }

            return user.role === APPLICATION_ROLES.SUPER_ADMIN;
        } catch (error: any) {
            logger.error("Error checking super admin permissions", error);
            throw error;
        }
    }
}