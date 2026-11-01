import { Button, Section } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { CircleDashedCheck, CircleX } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function ApplicationReviewedUser(props: Parameters<typeof NotificationTypes.APPLICATION_REVIEWED_USER>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={props.approved ? CircleDashedCheck : CircleX} title={`${props.approved ? "Your application was approved!" : "Your application was denied."}`} subtitle={<>Your application, <strong>"{props.appName}"</strong>, was {props.approved ? "approved" : "denied"} by {props.triggerUser.name}. {props.approved ? "Get started with your new application by clicking the button below" : "Please contact the administrator for more information, or submit a new request."}</>} />
            {props.approved && <Section className="pt-4">
                <Button href={props.link} className="bg-black px-4 py-3 text-white uppercase" style={{fontSize: "13px"}}>
                    View Application
                </Button>
            </Section>}
    </EmailTemplate>
}