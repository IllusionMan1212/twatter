export const excludedUserProps = [
    "email",
    "password",
    "resetPasswordToken",
    "resetPasswordTokenExpiry",
    "totpSecret",
] as const;

export type ExcludedUserProps = typeof excludedUserProps[number];
