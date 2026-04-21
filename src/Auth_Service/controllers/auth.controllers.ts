import { Request, Response, NextFunction } from "express";
import config from "../../shared/config/config";
import { APPLICATION_ROLES } from "../../shared/constants/roles";
import ResponseFormatter from "../../shared/utils/helpers/responseFormatter";


// 🔥 Interface instead of concrete class
interface IAuthService {
    onboardSuperAdmin(data: any): Promise<{ user: any; token: string }>;
    register(data: any): Promise<{ user: any; token: string }>;
    login(username: string, password: string): Promise<{ user: any; token: string }>;
    getProfile(userId: string): Promise<any>;
}

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export class AuthController {
    private authService: IAuthService;

    constructor(authService: IAuthService) {
        if (!authService) {
            throw new Error("authService is Required");
        }

        this.authService = authService;

        // 🔥 required for normal functions
        this.onboardSuperAdmin = this.onboardSuperAdmin.bind(this);
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.getProfile = this.getProfile.bind(this);
        this.logout = this.logout.bind(this);
    }

    async onboardSuperAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = req.body;

            const superAdminData = {
                username,
                email,
                password,
                role: APPLICATION_ROLES.SUPER_ADMIN,
            };

            const { token, user } =
                await this.authService.onboardSuperAdmin(superAdminData);

            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                maxAge: config.cookie.expiresIn,
            });

            res.status(201).json(
                ResponseFormatter.success(user, "Super admin created successfully", 201)
            );
        } catch (error) {
            next(error);
        }
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password, role } = req.body;

            const userData = {
                username,
                email,
                password,
                role: role || APPLICATION_ROLES.CLIENT_VIEWER,
            };

            const { token, user } =
                await this.authService.register(userData);

            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                maxAge: config.cookie.expiresIn,
            });

            res.status(201).json(
                ResponseFormatter.success(user, "User created successfully", 201)
            );
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;

            const { user, token } =
                await this.authService.login(username, password);

            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                maxAge: config.cookie.expiresIn,
            });

            res.status(200).json(
                ResponseFormatter.success(user, "User LoggedIn successfully", 200)
            );
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;

            const result = await this.authService.getProfile(userId!);

            res.status(200).json(
                ResponseFormatter.success(result, "Profile fetched successfully", 200)
            );
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie("authToken");

            res.status(200).json(
                ResponseFormatter.success({}, "Logout successful", 200)
            );
        } catch (error) {
            next(error);
        }
    }
}