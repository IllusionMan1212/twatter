import z from "zod";

export const DeleteOrApproveData = z.object({
    ids: z.string().array().nonempty(),
});
