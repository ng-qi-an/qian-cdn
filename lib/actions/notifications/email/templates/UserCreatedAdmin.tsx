import { Button, Section } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { User } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function UserCreatedAdmin(props: Parameters<typeof NotificationTypes.USER_CREATED_ADMIN>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={User} title="A new user was created." subtitle={<>{props.triggerUser.name} created a new user with the name <strong>"{props.newUser.name}"</strong> and role of "{props.newUser.role}".</>} />
            <Section className="pt-4">
                <Button href={props.link} className="bg-black px-4 py-3 text-white uppercase" style={{fontSize: "13px"}}>
                    View User
                </Button>
            </Section>
    </EmailTemplate>
}