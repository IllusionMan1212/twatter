import { Request, Response } from "express";
import { DeleteOrApproveData, GetReportersData, ResolveReportData } from "../validators/admin";
import { GetPagedData } from "../validators/general";
import { deleteEventsDB, deleteUsersDB, queryAllEvents, queryAllUsers, queryPendingReports, queryReporters, queryResolvedReports, resolveReportDB, toggleUserRestriction } from "../database/admin";
import { prisma } from "../database/client";
import { DatabaseError } from "../database/utils";
import { traversalSafeRm } from "../utils";
import { ReportReason } from "@prisma/client";

export async function getAllUsers(req: Request, res: Response) {
    const data = GetPagedData.safeParse(req.query);

    if (!data.success) {
        return res.status(400).json({ message: "Invalid or missing page number" });
    }

    const page = data.data.page;
    
    const accountCount = await prisma.user.count();
    const accounts = await queryAllUsers(page);

    return res.status(200).json({
        message: "Retrieved users successfully",
        accounts,
        accountCount,
    });
}

export async function getAllEvents(req: Request, res: Response) {
    const data = GetPagedData.safeParse(req.query);

    if (!data.success) {
        return res.status(400).json({ message: "Invalid or missing page number" });
    }

    const page = data.data.page;
    
    const eventCount = await prisma.event.count();
    const events = await queryAllEvents(page);

    return res.status(200).json({
        message: "Retrieved events successfully",
        events,
        eventCount,
    });
}

export async function unrestrictUsers(req: Request, res: Response) {
    const data = DeleteOrApproveData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const error = await toggleUserRestriction(data.data.ids, false);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    }

    return res.status(200).json({ message: `Successfully unrestricted ${data.data.ids.length} users` });
}

export async function restrictUsers(req: Request, res: Response) {
    const data = DeleteOrApproveData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const error = await toggleUserRestriction(data.data.ids, true);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    }

    return res.status(200).json({ message: `Successfully restricted ${data.data.ids.length} users` });
}

export async function deleteUsers(req: Request, res: Response) {
    const data = DeleteOrApproveData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const error = await deleteUsersDB(data.data.ids);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    }

    return res.status(200).json({ message: `Successfully deleted ${data.data.ids.length} users` });
}

export async function deleteEvents(req: Request, res: Response) {
    const data = DeleteOrApproveData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const error = await deleteEventsDB(data.data.ids);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    }

    for (const eventId of data.data.ids) {
        await traversalSafeRm("events", eventId);
    }

    return res.status(200).json({ message: `Successfully deleted ${data.data.ids.length} events` });
}

export async function getPendingReports(req: Request, res: Response) {
    const data = GetPagedData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const reports = await queryPendingReports(data.data.page);

    return res.status(200).json({ message: "Successfully fetched pending reports", reports });
}

export async function getResolvedReports(req: Request, res: Response) {
    const data = GetPagedData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const reports = await queryResolvedReports(data.data.page);

    return res.status(200).json({ message: "Successfully fetched resolved reports", reports });
}

export async function getReporters(req: Request, res: Response) {
    const data = GetReportersData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const reporters = await queryReporters(data.data.postId, data.data.reason as ReportReason, data.data.page);

    return res.status(200).json({ message: "Successfully fetched report submitters", reporters });
}

export async function resolveReport(req: Request, res: Response) {
    const data = ResolveReportData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }
    const error = await resolveReportDB(data.data.reason as ReportReason, data.data.postId, data.data.deleted);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    } else if (error === DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND || error === DatabaseError.NOT_FOUND) {
        return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json({ message: "Successfully resolved report" });
}
