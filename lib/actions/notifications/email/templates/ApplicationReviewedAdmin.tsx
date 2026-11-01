import { Button, Section } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { CircleDashedCheck, CircleX } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function ApplicationReviewedAdmin(props: Parameters<typeof NotificationTypes.APPLICATION_REVIEWED_ADMIN>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={props.approved ? CircleDashedCheck : CircleX} title={`${props.approved ? "An application was approved." : "An application was denied."}`} subtitle={<>{props.triggerUser.name} {props.approved ? "approved" : "denied"} an application <strong>"{props.appName}"</strong> by {props.appOwnerName} on <strong>{props.databaseName}</strong>.</>} />
            {props.approved && <Section className="pt-4">
                <Button href={props.link} className="bg-black px-4 py-3 text-white uppercase" style={{fontSize: "13px"}}>
                    View Application
                </Button>
            </Section>}
    </EmailTemplate>
}