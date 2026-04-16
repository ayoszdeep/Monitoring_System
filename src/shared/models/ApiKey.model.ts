import mongoose, { Schema, Document } from "mongoose";

export interface IApiKey extends Document {
    keyId: string;
    keyValue: string;
    clientId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    environment: "production" | "staging" | "development" | "testing";
    isActive: boolean;
    permissions: {
        canIngest: boolean;
        canReadAnalytics: boolean;
        allowedServices: string[];
    };
    security: {
        allowedIPs: string[];
        allowedOrigins: string[];
        lastRotated: Date;
        rotationWarningDays: number;
    };
    expiresAt: Date;
    metadata?: {
        createdBy?: mongoose.Types.ObjectId;
        purpose?: string;
        tags: string[];
    };
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    isExpired(): boolean;
}

const apiKeySchema = new Schema<IApiKey>(
    {
        keyId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        keyValue: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        clientId: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        environment: {
            type: String,
            enum: ["production", "staging", "development", "testing"],
            default: "production",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        permissions: {
            canIngest: { type: Boolean, default: true },
            canReadAnalytics: { type: Boolean, default: false },
            allowedServices: [{ type: String }],
        },
        security: {
            allowedIPs: [{ type: String }],
            allowedOrigins: [{ type: String }],
            lastRotated: {
                type: Date,
                default: Date.now,
            },
            rotationWarningDays: {
                type: Number,
                default: 30,
            },
        },
        expiresAt: {
            type: Date,
            index: true,
        },
        metadata: {
            createdBy: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            purpose: {
                type: String,
            },
            tags: [{ type: String }],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
        collection: "api_keys",
    }
);

apiKeySchema.index({ clientId: 1, isActive: 1 });
apiKeySchema.index({ keyValue: 1, isActive: 1 });
apiKeySchema.index({ environment: 1, clientId: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

apiKeySchema.methods.isExpired = function (): boolean {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt) < new Date();
};

const ApiKey = mongoose.model<IApiKey>("ApiKey", apiKeySchema);

export default ApiKey;