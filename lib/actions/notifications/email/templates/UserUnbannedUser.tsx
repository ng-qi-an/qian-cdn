import { Button, Section } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { Gavel, User } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function UserUnbannedUser(props: Parameters<typeof NotificationTypes.USER_UNBANNED_USER>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={Gavel} title="Your account has been unbanned." subtitle={<>{props.triggerUser.name} has unbanned your account. You can now sign back into Unified CDN.</>} />
            <Section className="pt-4">
                <Button href={props.link} className="bg-black px-4 py-3 text-white uppercase" style={{fontSize: "13px"}}>
                    Sign in
                </Button>
            </Section>
    </EmailTemplate>
}