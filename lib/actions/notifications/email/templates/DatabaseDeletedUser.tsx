import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { DatabaseX } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function DatabaseDeletedUser(props: Parameters<typeof NotificationTypes.DATABASE_DELETED_USER>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={DatabaseX} title="Your database was deleted." subtitle={<>{props.triggerUser.name} deleted your database <strong>"{props.databaseName}"</strong>. If you think this was a mistake, contact your administrator for more information.</>} />
    </EmailTemplate>
}