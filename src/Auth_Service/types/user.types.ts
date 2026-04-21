
export interface IUser {
    _id?: string;

    username: string;
    email: string;
    password: string;

    role: "super_admin" | "client_admin" | "client_viewer";

    clientId?: string;

    isActive: boolean;

    permissions: {
        canCreateApiKeys: boolean;
        canManageUsers: boolean;
        canViewAnalytics: boolean;
        canExportData: boolean;
    };

    createdAt?: Date;
    updatedAt?: Date;
}