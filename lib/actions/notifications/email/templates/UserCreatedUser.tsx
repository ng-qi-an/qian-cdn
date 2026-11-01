import { Button, Column, Heading, Preview, Row, Section, Text } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { StaticEmailIcon } from "./EmailIcon";

export default function UserCreatedUser(props: Parameters<typeof NotificationTypes.USER_CREATED_USER>[0]) {
    return <EmailTemplate>
            <Section align="left" className="mobile:!max-w-full max-w-[490px] mb-4 pb-0">
                <Preview>Welcome to Unified CDN!</Preview>
                <Heading as="h1" className="uppercase font-bold text-balance">
                    Welcome to the platform.
                </Heading>
                <Text className="m-0 pt-6">
                    Hey {props.newUser.name},
                </Text>
                <Text className="m-0 mt-4 text-balance pb-6">
                    You've been invited by <strong>{props.triggerUser.name}</strong> to join Unified CDN. Your account has already been created for you:
                </Text>
                <div className="p-4 border border-gray-300 max-w-[500px]">
                    <Row>
                        <Column>
                            <Row>
                                <Text className="m-0 font-bold">Email:</Text>
                            </Row>
                            {props.newUser.password && <Row>
                                <Text className="m-0 font-bold">Password:</Text>
                            </Row>}
                        </Column>
                        <Column>
                            <Text className="m-0">{props.newUser.email}</Text>
                            {props.newUser.password && <Text className="m-0">{props.newUser.password}</Text>}
                        </Column>
                    </Row>
                </div>
                <Section className="pt-10 pr-8 max-w-[500px]">
                    <Button href={props.link} className="bg-black px-4 py-3 text-white uppercase w-full text-center" style={{fontSize: "13px"}}>
                        Get Started
                    </Button>
                    <Text className="m-0 pt-2 px-4 opacity-70 w-full text-center">{props.newUser.password ? "Please change your password immediately after signing in." : "Check if you have recieved your password from your admin."}</Text>
                </Section>
            </Section>
    </EmailTemplate>
}