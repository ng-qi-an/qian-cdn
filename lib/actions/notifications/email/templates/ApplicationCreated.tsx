import { Button, Heading, Section, Text } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { StaticEmailIcon } from "./EmailIcon";
import { AppWindowMac } from "lucide-static";

export default function ApplicationCreated(props: Parameters<typeof NotificationTypes.APPLICATION_CREATED>[0]) {
    return <EmailTemplate>
            <Section align="left" className="mobile:!max-w-full max-w-[490px] mb-4">
              <StaticEmailIcon
                svg={AppWindowMac}
                size={48}
              />
              <Heading as="h1" className="uppercase font-bold text-balance">
                A new application has been created
              </Heading>
              <Text className="m-0 mt-6 text-balance">
                {props.triggerUser.name} created an application with the name &quot;<strong>{props.appName}</strong>&quot; on database &quot;<strong>{props.databaseName}</strong>&quot;. You can view the application details by clicking the button below.
              </Text>
            </Section>
            <Section className="pt-4">
                <Button href={props.link} className="bg-black px-4 py-3 text-white uppercase" style={{fontSize: "12px"}}>
                    View Application
                </Button>
            </Section>
    </EmailTemplate>
}