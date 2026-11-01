import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { Trash2 } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function ApplicationDeletedAdmin(props: Parameters<typeof NotificationTypes.APPLICATION_DELETED_ADMIN>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={Trash2} title="An application was deleted." subtitle={<>{props.triggerUser.name} deleted an application named <strong>"{props.appName}"</strong> by <strong>"{props.ownerName}"</strong>.</>} />
    </EmailTemplate>
}