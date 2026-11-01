import { Button, Section } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { Key } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function APIKeyDeletedUser(props: Parameters<typeof NotificationTypes.APIKEY_DELETED_USER>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={Key} title="Your API key was deleted." subtitle={<>{props.triggerUser.name} deleted your API key <strong>"{props.apiKeyName}"</strong> from your application "<strong>{props.appName}</strong>". If you think this was a mistake, contact your administrator for more information.</>} />
            <Section className="pt-4">
                <Button href={props.link} className="bg-black px-4 py-3 text-white uppercase" style={{fontSize: "13px"}}>
                    View API Keys
                </Button>
            </Section>
    </EmailTemplate>
}