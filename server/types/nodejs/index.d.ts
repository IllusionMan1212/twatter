declare namespace NodeJS {
    export interface ProcessEnv {
        JWT_SECRET: string;
        JWT_ENCRYPTION_KEY: string;
        DEVICE_IDENTIFIER_KEY: string;
    }
}
