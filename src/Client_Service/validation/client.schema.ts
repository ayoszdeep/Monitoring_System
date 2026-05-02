import { z } from "zod";
import { passwordSchema } from "../../shared/validators/User.validator";
import { CLIENT_ROLES } from "../../shared/constants/roles";

export const createClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  description: z.string().max(500).optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
});

export const createClientUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  role: z.enum(CLIENT_ROLES as unknown as [string, ...string[]]).optional(),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  environment: z.enum(["production", "staging", "development", "testing"]).default("production").optional(),
});
