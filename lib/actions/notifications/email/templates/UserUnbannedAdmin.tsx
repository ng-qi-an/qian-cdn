import { Button, Section } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { Gavel, User } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function UserUnbannedAdmin(props: Parameters<typeof NotificationTypes.USER_UNBANNED_ADMIN>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={Gavel} title="A user has been unbanned." subtitle={<>{props.triggerUser.name} unbanned the user <strong>"{props.user.name}"</strong>.</>} />
            <Section className="pt-4">
                <Button href={props.link} className="bg-black px-4 py-3 text-white uppercase" style={{fontSize: "13px"}}>
                    View User
                </Button>
            </Section>
    </EmailTemplate>
}