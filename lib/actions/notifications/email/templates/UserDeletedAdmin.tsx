import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { UserX } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function UserDeletedAdmin(props: Parameters<typeof NotificationTypes.USER_UNBANNED_ADMIN>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={UserX} title="A user has been deleted." subtitle={<>{props.triggerUser.name} has deleted the user <strong>"{props.user.name}"</strong>.</>} />
    </EmailTemplate>
}