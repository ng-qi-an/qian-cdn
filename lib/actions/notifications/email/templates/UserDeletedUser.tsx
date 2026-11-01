import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { UserX } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function UserDeletedUser(props: Parameters<typeof NotificationTypes.USER_DELETED_USER>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={UserX} title="Your account has been deleted." subtitle={<>{props.triggerUser.name} has permanently deleted your account. If this was a mistake, please contact your administrator immediately.</>} />
    </EmailTemplate>
}