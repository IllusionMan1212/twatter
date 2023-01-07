import z from "zod";
import { GetPagedData } from "./general";

const SearchType = z.enum(["all", "event", "user"], {
    required_error: "Search type is required",
});

export const SearchData = GetPagedData.extend({
    query: z
        .string({ required_error: "Search query cannot be empty" }).trim()
        .min(1, "Search query cannot be empty"),
    type: SearchType,
});
