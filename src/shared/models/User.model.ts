import mongoose, { Document, Schema } from "mongoose";
import argon2 from "argon2";
import { passwordSchema } from "../validators/User.validator";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: "super_admin" | "client_admin" | "client_viewer";
    clientId?: mongoose.Types.ObjectId;
    isActive: boolean;
    permissions: {
        canCreateApiKeys: boolean;
        canManageUsers: boolean;
        canViewAnalytics: boolean;
        canExportData: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        validate: {
            validator: function (userName: string) {
                return /^[a-zA-Z0-9_.-]+$/.test(userName);
            },
            message: "Please enter a valid username"
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (email: string) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: "Please enter a valid email"
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        validate: {
            validator: function (this: any, password: string) {
                if (this.isModified && this.isModified("password") && password && !password.startsWith("$argon2")) {
                    const validation = passwordSchema.safeParse(password);
                    return validation.success;
                }
                return true;
            },
            message: function (props: any) {
                if (props.value && !props.value.startsWith("$argon2")) {
                    const validation = passwordSchema.safeParse(props.value);
                    if (!validation.success) {
                        return (validation.error as any).errors.map((e: any) => e.message).join(". ");
                    }
                }
                return "Password validation failed";
            }
        }
    },
    role: {
        type: String,
        enum: ["super_admin", "client_admin", "client_viewer"],
        default: "client_viewer"
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: "Client",
        required: function (this: IUser) {
            return this.role !== "super_admin";
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permissions: {
        canCreateApiKeys: { type: Boolean, default: false },
        canManageUsers: { type: Boolean, default: false },
        canViewAnalytics: { type: Boolean, default: true },
        canExportData: { type: Boolean, default: false }
    }
}, {
    timestamps: true,
    collection: "users"
});

userSchema.pre("save", async function (this: any) {
    if (!this.isModified("password")) return;
    this.password = await argon2.hash(this.password);
});

userSchema.methods.comparePassword = async function (candidate: string) {
    return argon2.verify(this.password, candidate);
};

userSchema.index({ clientId: 1, isActive: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model<IUser>("User", userSchema);
export default User;