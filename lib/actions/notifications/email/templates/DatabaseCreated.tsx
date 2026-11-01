import { Button, Section } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { DatabasePlus } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function DatabaseCreated(props: Parameters<typeof NotificationTypes.DATABASE_CREATED>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={DatabasePlus} title="A database was created." subtitle={<>{props.triggerUser.name} created a database with the name <strong>"{props.databaseName}"</strong>.</>} />
            <Section className="pt-4">
                <Button href={props.link} className="bg-black px-4 py-3 text-white uppercase" style={{fontSize: "13px"}}>
                    View Database
                </Button>
            </Section>
    </EmailTemplate>
}