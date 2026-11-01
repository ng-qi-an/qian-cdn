import { Button, Column, Row, Section, Text } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { Ban } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";
import { TZDate } from "@date-fns/tz";

export default function UserBannedUser(props: Parameters<typeof NotificationTypes.USER_BANNED_USER>[0]) {
    const expiryDate = props.expiresAt ? new TZDate(props.expiresAt, process.env.NEXT_PUBLIC_TIMEZONE) : null;
    return <EmailTemplate>
            <EmailSectionHero icon={Ban} title="Your account has been banned." subtitle={<>{props.triggerUser.name} has banned your account. To appeal your ban, please contact an administrator directly.</>} />
            <Section>
            <div className="p-4 border border-gray-300 max-w-[500px]">
                <Row>
                    <Column>
                        <Text className="m-0 font-bold">Expires at:</Text>
                        <Text className="m-0 font-bold">Reason:</Text>
                    </Column>
                    <Column>
                        <Text className="m-0">{expiryDate?.toLocaleString(undefined, { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) ?? "Permanent ban"}</Text>
                        <Text className="m-0">{props.reason}</Text>
                    </Column>
                </Row>
            </div>
            </Section>
    </EmailTemplate>
}