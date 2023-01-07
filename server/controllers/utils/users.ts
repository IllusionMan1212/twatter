export const excludedUserProps = [
    "password",
    "resetPasswordToken",
    "resetPasswordTokenExpiry",
    "totpSecret",
] as const;

export type ExcludedUserProps = typeof excludedUserProps[number];
