import { Button, Section } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { AppWindowMac, Trash2 } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function ApplicationDeletedUser(props: Parameters<typeof NotificationTypes.APPLICATION_DELETED_USER>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={Trash2} title="Your application was deleted." subtitle={<>{props.triggerUser.name} deleted your application <strong>"{props.appName}"</strong>. If you think this was a mistake, contact your administrator for more information.</>} />
    </EmailTemplate>
}