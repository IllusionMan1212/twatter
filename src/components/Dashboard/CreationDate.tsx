import { memo, ReactElement } from "react";
import { formatAnnouncementDate } from "src/utils/helpers";

interface CreationDateProps {
    date: string;
}

const CreationDate = memo(function CreationDate({
    date,
}: CreationDateProps): ReactElement {
    return <>{formatAnnouncementDate(date)}</>;
});

export default CreationDate;
