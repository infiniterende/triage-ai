import z from "zod";

export const signUpFormSchema = z.object({
  email: z
    .string()
    .email({
      message: "Please enter a valid email",
    })
    .trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter" })
    .regex(/[0-9/]/, { message: "Contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character",
    })
    .trim(),
  name: z.string().regex(/^[a-zA-Z]+$/, { message: "Contains only letters" }),
  specialty: z.string(),
});

export type SignUpActionState = {
  form?: {
    email?: string;
    password?: string;
    name?: string;
    specialty?: string;
  };
  errors?: {
    email?: string[];
    password?: string[];
    name?: string[];
    specialty?: string[];
  };
};
