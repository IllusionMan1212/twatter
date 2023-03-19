import { Request, Response } from "express";
import { SearchData } from "../validators/search";
import { searchEvents, searchUsers } from "../database/search";

export async function doSearch(req: Request, res: Response) {
    const data = SearchData.safeParse(req.query);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    switch (data.data.type) {
    case "user": {
        const users = await searchUsers(data.data.query, data.data.page, req.session.user.id);
        return res.status(200).json({ message: "Successfully fetched search results", users });
    }
    case "event": {
        const events = await searchEvents(data.data.query, req.session.user.id, data.data.page);
        return res.status(200).json({ message: "Successfully fetched search results", events });
    }
    case "all":
    default: {
        const [users, events] = await Promise.all([
            searchUsers(data.data.query, 0, req.session.user.id, 5),
            searchEvents(data.data.query, req.session.user.id, 0, 5),
        ]);

        return res.status(200).json({ message: "Successfully fetched search results", users, events });
    }
    }
}
