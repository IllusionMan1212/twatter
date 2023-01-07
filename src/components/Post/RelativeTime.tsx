import { memo, ReactElement } from "react";

interface RelativeTimeProps {
    date: string;
    type?: "post" | "conversation";
}

const RelativeTime = memo(function RelativeTime({
    date,
    type = "post",
}: RelativeTimeProps): ReactElement {
    const now = new Date();
    const postDate = new Date(date);
    const difference = now.getTime() - postDate.getTime();

    if (now.getFullYear() > postDate.getFullYear()) {
        // different years
        return (
            <span>
                {postDate.getDate()}{" "}
                {postDate.toLocaleString("default", { month: "short" })}{" "}
                {postDate.getFullYear()} |{" "}
                {postDate.toLocaleString("default", {
                    hour: "numeric",
                    minute: "2-digit",
                })}
            </span>
        );
    } else if (difference >= 1000 * 60 * 60 * 24 * 7) {
        // older than 7 days. display month and day
        return (
            <span>
                {postDate.toLocaleString("default", { month: "short" })}{" "}
                {postDate.getDate()}
            </span>
        );
    } else if (difference >= 1000 * 60 * 60 * 24) {
        const suffix = type === "post" ? " days ago" : "d";

        // older than 24 hours. display days
        return (
            <span>
                {Math.floor(difference / (1000 * 60 * 60 * 24))}
                {suffix}
            </span>
        );
    } else if (difference >= 1000 * 60 * 60) {
        const suffix = type === "post" ? " hours ago" : "h";

        // older than 60 minutes. display hours
        return (
            <span>
                {Math.floor(difference / (1000 * 60 * 60))}
                {suffix}
            </span>
        );
    } else if (difference >= 1000 * 60) {
        const suffix = type === "post" ? " minutes ago" : "m";

        // older than 60 seconds. display minutes
        return (
            <span>
                {Math.floor(difference / (1000 * 60))}
                {suffix}
            </span>
        );
    } else if (difference >= 1000 * 5) {
        const suffix = type === "post" ? " seconds ago" : "s";

        // older than 5 seconds. display seconds
        return (
            <span>
                {Math.floor(difference / 1000)}
                {suffix}
            </span>
        );
    } else {
        const message = type === "post" ? "A few seconds ago" : "now";
        // younger than 5 seconds. display "now"
        return <span>{message}</span>;
    }
});

export default RelativeTime;
