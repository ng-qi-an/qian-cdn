import { Button, Column, Row, Section, Text } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { Lock } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function UserPasswordChangedUser(props: Parameters<typeof NotificationTypes.USER_PASSWORD_CHANGED_USER>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={Lock} title="Your password has been changed." subtitle={<>{props.triggerUser.name} has changed your password. {props.newPassword ? "Here are you new credentials, " : "Contact your administrator for your new credentials."}</>} />
            <Section>
            {props.newPassword && <div className="p-4 border border-gray-300 max-w-[500px]">
                <Row>
                    <Column>
                        <Text className="m-0 font-bold w-max">Password:</Text>
                    </Column>
                    <Column>
                        <Text className="m-0 w-full">{props.newPassword}</Text>
                    </Column>
                </Row>
            </div>}
            </Section>
            <Section className="pt-4 pr-8">
                <Button href={props.link} className={`bg-black ${props.newPassword && "max-w-[500px] w-full"} text-center px-4 py-3 text-white uppercase`} style={{fontSize: "13px"}}>
                    Sign in
                </Button>
                <Text className={`m-0 pt-4 opacity-70 w-full ${props.newPassword && "max-w-[500px] text-center"}`}>Please change your password immediately after signing in.</Text>
            </Section>
    </EmailTemplate>
}