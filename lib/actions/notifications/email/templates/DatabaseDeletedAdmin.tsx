import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { DatabaseX, Trash2 } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function DatabaseDeletedAdmin(props: Parameters<typeof NotificationTypes.DATABASE_DELETED_ADMIN>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={DatabaseX} title="A database was deleted." subtitle={<>{props.triggerUser.name} deleted a database named <strong>"{props.databaseName}"</strong> by {props.ownerName}.</>} />
    </EmailTemplate>
}