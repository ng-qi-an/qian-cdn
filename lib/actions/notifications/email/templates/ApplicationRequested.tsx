import { Button, Section } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { Gavel } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function ApplicationRequested(props: Parameters<typeof NotificationTypes.APPLICATION_REQUESTED>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={Gavel} title="A new application was requested." subtitle={<>{props.triggerUser.name} requested an application with the name <strong>"{props.appName}"</strong> on database "<strong>{props.databaseName}</strong>". You can review the application details by clicking the button below.</>} />
            <Section className="pt-4">
                <Button href={props.link} className="bg-black px-4 py-3 text-white uppercase" style={{fontSize: "13px"}}>
                    View Application
                </Button>
            </Section>
    </EmailTemplate>
}