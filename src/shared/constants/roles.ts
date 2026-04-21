export const ROLES = [
    "super_admin",
    "client_admin",
    "client_viewer",
] as const;

export const CLIENT_ROLES = [
    "client_admin",
    "client_viewer",
] as const;


export type Role = typeof ROLES[number];
export type ClientRole = typeof CLIENT_ROLES[number];

export const APPLICATION_ROLES = {
    SUPER_ADMIN: "super_admin",
    CLIENT_VIEWER: "client_viewer",
    CLIENT_ADMIN: "client_admin",
} as const;


export const isValidClientRole = (role: string): role is ClientRole => {
    return CLIENT_ROLES.includes(role as ClientRole);
};

export const isValidRole = (role: string): role is Role => {
    return ROLES.includes(role as Role);
};