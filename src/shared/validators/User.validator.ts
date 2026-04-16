import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 chars long!")
  .max(16, "Password must be at most 16 chars long!")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Must contain uppercase letter",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Must contain lowercase letter",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Must contain number",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Must contain special character",
  })
  .refine(
    (val) =>
      ![
        "password",
        "123456",
        "qwerty",
        "admin",
        "letmein",
        "password123",
        "admin123",
        "12345678",
        "welcome",
      ].includes(val.toLowerCase()),
    {
      message: "Password is too common",
    }
  );
