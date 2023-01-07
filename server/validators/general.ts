import z from "zod";

export const GetPagedData = z.object({
    page: z.preprocess(
        (a) => {
            const n = parseInt(a as string, 10);
            if (isNaN(n)) return -1;
            return n;
        },
        z.number().nonnegative("Invalid page number"),
    ),
});

export const GetDataById = z.object({
    id: z.string().min(1, "ID cannot be empty"),
});
