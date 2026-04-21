import { z } from "zod";
import { APPLICATION_ROLES } from "../../shared/constants/roles";
import { passwordSchema } from "../../shared/validators/User.validator";

export const onboardSuperAdminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 chars long!"),
  email: z.string().email("Invalid email format"),
  password: passwordSchema,
});

export const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 chars long!"),
  email: z.string().email("Invalid email format"),
  password: passwordSchema,
  role: z.enum([APPLICATION_ROLES.SUPER_ADMIN, APPLICATION_ROLES.CLIENT_ADMIN, APPLICATION_ROLES.CLIENT_VIEWER]).optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required!"),
  password: z.string().min(1, "Password is required!"),
});
