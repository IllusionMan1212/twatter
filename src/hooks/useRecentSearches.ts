import { useEffect, useState } from "react";

interface ReturnVal {
    recent: string[];
    addItem: (item: string) => void;
    removeItem: (index: number) => void;
}

export default function useRecentSearches(): ReturnVal {
    const [recent, setRecent] = useState<string[]>([]);

    useEffect(() => {
        const rec = JSON.parse(localStorage.getItem("recent-searches") ?? "[]") as string[];

        setRecent(rec);
    }, []);

    const addItem = (item: string) => {
        const rec = JSON.parse(localStorage.getItem("recent-searches") ?? "[]") as string[];

        if (rec.length >= 5) {
            rec.pop();
        }

        rec.unshift(item);
        setRecent([...rec]);

        localStorage.setItem("recent-searches", JSON.stringify(rec));
    };

    const removeItem = (index: number) => {
        const rec = JSON.parse(localStorage.getItem("recent-searches") ?? "[]") as string[];

        rec.splice(index, 1);
        setRecent([...rec]);

        localStorage.setItem("recent-searches", JSON.stringify(rec));
    };

    if (typeof window === "undefined") {
        return {
            recent: [],
            addItem,
            removeItem,
        };
    }

    return {
        recent,
        addItem,
        removeItem,
    };
}
