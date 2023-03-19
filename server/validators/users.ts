import z from "zod";

export const USERNAME_REGEX = /^[a-z0-9_]+$/gi;

export const RegisterUserData = z.object({
    username: z
        .string()
        .trim()
        .min(3, "Username is too short, at least 3 characters are required")
        .max(16, "Username is too long, it cannot exceed 16 characters")
        .regex(USERNAME_REGEX, "Username cannot contain special characters, only letters, numbers and underscore are allowed"),
    email: z
        .string()
        .trim()
        .email("Email cannot be empty"),
    password: z.string().min(8, "Password is too short, at least 8 characters are required"),
    passwordConfirm: z.string().min(8, "Password confirmation is too short, at least 8 characters are required"),
});

export const LoginUserData = z.object({
    username: z.string().trim().min(1, "Username cannot be empty"),
    password: z.string().min(1, "Password cannot be empty"),
});

export const ForgotPasswordData = z.object({
    email: z.string().trim().min(1, "Email cannot be empty"),
});

export const ValidateResetPasswordTokenData = z.object({
    token: z.string().trim().min(1, "Token cannot be empty"),
});

export const ResetPasswordData = z.object({
    password: z.string().min(8, "Password is too short, at least 8 characters are required"),
    passwordConfirm: z.string().min(8, "Password confirmation is too short, at least 8 characters are required"),
    token: z.string().min(1, "Token cannot be empty"),
});

export const GetUserData = z.object({
    username: z.string().min(1, "Username cannot be empty"),
});

export const FollowData = z.object({
    userId: z.string({ required_error: "User ID is required" }).min(1, "User ID cannot be empty"),
});
