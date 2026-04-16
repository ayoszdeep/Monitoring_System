import { z } from "zod";

const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
const urlRegex = /^https?:\/\/[^\s]+$/;

export const createApiKeySchema = z.object({
  keyId: z.string().min(1),

  keyValue: z.string().min(1),

  clientId: z.string().min(1),

  name: z.string().min(1).max(100),

  description: z.string().max(500).optional(),

  environment: z.enum([
    "production",
    "staging",
    "development",
    "testing",
  ]).default("production"),

  permissions: z.object({
    canIngest: z.boolean().default(true),
    canReadAnalytics: z.boolean().default(false),
    allowedServices: z.array(z.string().trim()).default([]),
  }),

  security: z.object({
    allowedIPs: z.array(
      z.string().refine(
        (val) => ipRegex.test(val) || val === "0.0.0.0/0",
        { message: "Invalid IP format" }
      )
    ).default([]),

    allowedOrigins: z.array(
      z.string().refine(
        (val) => urlRegex.test(val) || val === "*",
        { message: "Invalid origin format" }
      )
    ).default([]),

    rotationWarningDays: z.number().min(1).max(365).default(30),
  }),

  expiresAt: z.date().optional(),

  metadata: z.object({
    createdBy: z.string().optional(),
    purpose: z.string().max(200).optional(),
    tags: z.array(z.string().max(50)).default([]),
  }).optional(),

  createdBy: z.string().min(1),
});