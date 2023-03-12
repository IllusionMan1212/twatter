import { ReportReason } from "@prisma/client";
import z from "zod";
import { GetPagedData } from "./general";

export const DeleteOrApproveData = z.object({
    ids: z.string().array().nonempty(),
});

export const GetReportersData = GetPagedData.extend({
    postId: z.string(),
    reason: z.string(),
});

export const ResolveReportData = z.object({
    postId: z.string({ required_error: "Post id is required" }).min(1, "Post Id is required"),
    reason: z.nativeEnum(ReportReason, { required_error: "Reason is required" }),
    deleted: z.boolean({ required_error: "Deleted is required" }),
});
