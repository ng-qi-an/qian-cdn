import { Button, Section } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { User } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function UserPasswordChangedAdmin(props: Parameters<typeof NotificationTypes.USER_PASSWORD_CHANGED_ADMIN>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={User} title="A user's password has been changed." subtitle={<>{props.triggerUser.name} changed the password for the user <strong>"{props.user.name}"</strong>.</>} />
            <Section className="pt-4">
                <Button href={props.link} className="bg-black px-4 py-3 text-white uppercase" style={{fontSize: "13px"}}>
                    View User
                </Button>
            </Section>
    </EmailTemplate>
}