export function exclude<T, Key extends keyof T>(
    data: T,
    ...keys: Key[]
): Omit<T, Key> {
    for (const key of keys) {
        delete data[key];
    }
    return data;
}

export enum DatabaseError {
    UNKNOWN = -1,
    SUCCESS,
    DUPLICATE,
    NOT_FOUND,
    NOT_AUTHORIZED,
    OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND,
    FOREIGN_KEY_CONSTRAINT_FAILED,

    // Events Codes
    EXPIRED = 100,
}
