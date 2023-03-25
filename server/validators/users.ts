import z from "zod";
import { GetPagedData } from "./general";

export const USERNAME_REGEX = /^[a-z0-9_]+$/gi;

export const RegisterUserData = z.object({
    username: z
        .string({ required_error: "Username is required" })
        .trim()
        .min(3, "Username is too short, at least 3 characters are required")
        .max(16, "Username is too long, it cannot exceed 16 characters")
        .regex(USERNAME_REGEX, "Username cannot contain special characters, only letters, numbers and underscore are allowed"),
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email("Email cannot be empty"),
    password: z.string({ required_error: "password is required" }).min(8, "Password is too short, at least 8 characters are required"),
    passwordConfirm: z.string({ required_error: "passwordConfirm is required" }).min(8, "Password confirmation is too short, at least 8 characters are required"),
});

export const LoginUserData = z.object({
    username: z.string({ required_error: "username is required" }).trim().min(1, "Username cannot be empty"),
    password: z.string({ required_error: "password is required" }).min(1, "Password cannot be empty"),
});

export const ForgotPasswordData = z.object({
    email: z.string({ required_error: "email is required" }).trim().min(1, "Email cannot be empty"),
});

export const ValidateResetPasswordTokenData = z.object({
    token: z.string({ required_error: "token is required" }).trim().min(1, "Token cannot be empty"),
});

export const ResetPasswordData = z.object({
    password: z.string({ required_error: "passowrd is required" }).min(8, "Password is too short, at least 8 characters are required"),
    passwordConfirm: z.string({ required_error: "passwordConfirm is required" }).min(8, "Password confirmation is too short, at least 8 characters are required"),
    token: z.string({ required_error: "token is required" }).min(1, "Token cannot be empty"),
});

export const GetUserData = z.object({
    username: z.string({ required_error: "username is required" }).min(1, "Username cannot be empty"),
});

export const FollowData = z.object({
    userId: z.string({ required_error: "User ID is required" }).min(1, "User ID cannot be empty"),
});

export const GetFollowersData = GetPagedData.extend({
    userId: z.string({ required_error: "User ID is required" }).min(1, "User ID cannot be empty"),
});
