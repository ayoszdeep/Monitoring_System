export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
    role?: string;
}

export interface LoginDTO {
    username: string;
    password: string;
}

export interface UserResponseDTO {
    _id: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
}