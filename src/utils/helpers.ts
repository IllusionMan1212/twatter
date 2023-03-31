export function formatAnnouncementDate(_date: string): string {
    const date = new Date(_date);

    return `${date.toLocaleString("default", { day: "2-digit" })}/${date.toLocaleString(
        "default",
        { month: "2-digit" },
    )}/${date.getFullYear()}`;
}

function nth(day: number): string {
    if (day > 3 && day < 21) return day + "th";
    switch (day % 10) {
    case 1:
        return day + "st";
    case 2:
        return day + "nd";
    case 3:
        return day + "rd";
    default:
        return day + "th";
    }
}

export function formatEventDate(_date: string): string {
    const now = new Date();
    const date = new Date(_date);
    if (date.getFullYear() === now.getFullYear()) {
        return `${nth(date.getDate())} ${date.toLocaleString("en-US", {
            month: "long",
        })} · ${date.toLocaleString("en-US", { timeStyle: "short" })}`;
    }

    return `${nth(date.getDate())} ${date.toLocaleString("en-US", {
        month: "long",
    })}, ${date.getFullYear()} · ${date.toLocaleString("en-US", { timeStyle: "short" })}`;
}
