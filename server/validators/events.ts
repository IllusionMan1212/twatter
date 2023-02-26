import z from "zod";
import { linkAllTransformer } from "./posts";

export const AddEventData = z.object({
    title: z.string().min(1, "Title cannot be empty"),
    description: linkAllTransformer(z.string().min(1, "Description cannot be empty")),
    location: z.string().min(1, "Location cannot be empty"),
    time: z.preprocess(
        (a) => {
            return new Date(a as string);
        },
        z.date()
            .min(new Date(), "DateTime cannot be in the past")
            .max(new Date(Date.now() + (3600 * 24 * 365 * 200 * 1000)), "DateTime cannot be too far in the future"), // 200 years
    ),
});

export const ToggleInterestData = z.object({
    interest: z.boolean(),
});
